package controller

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"time"

	"AI-Based-Recruitment-Screening-and-Employee-Advisory-System/backend/dto"
	"AI-Based-Recruitment-Screening-and-Employee-Advisory-System/backend/entity"
	"AI-Based-Recruitment-Screening-and-Employee-Advisory-System/backend/services"

	"github.com/gin-gonic/gin"
)

type JobController struct {
	geminiService *services.GeminiService
	jobService    *services.JobService
}

func NewJobController(geminiService *services.GeminiService, jobService *services.JobService) *JobController {
	return &JobController{
		geminiService: geminiService,
		jobService:    jobService,
	}
}

// ExtractFromImage: รับไฟล์รูปภาพ -> บันทึกลง disk -> ส่งให้ Gemini สกัดข้อมูล -> คืนค่าข้อมูลสกัด + image_url
func (c *JobController) ExtractFromImage(ctx *gin.Context) {
	if c.geminiService == nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Gemini Service ไม่ได้เปิดใช้งาน หรือตั้งค่า API Key ไม่ถูกต้อง"})
		return
	}

	fileHeader, err := ctx.FormFile("image")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาแนบไฟล์รูปภาพในฟิลด์ 'image'"})
		return
	}

	// 1. สร้างโฟลเดอร์สำหรับเก็บไฟล์รูปภาพถ้ายังไม่มี
	uploadDir := "./uploads/jobs"
	if err := os.MkdirAll(uploadDir, os.ModePerm); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถสร้างโฟลเดอร์บันทึกไฟล์ได้"})
		return
	}

	// 2. ตั้งชื่อไฟล์ใหม่ด้วย Timestamp เพื่อกันชื่อซ้ำ และเซฟไฟล์ลง Server
	filename := fmt.Sprintf("%d_%s", time.Now().Unix(), filepath.Base(fileHeader.Filename))
	filePath := filepath.Join(uploadDir, filename)

	if err := ctx.SaveUploadedFile(fileHeader, filePath); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถบันทึกไฟล์รูปภาพได้"})
		return
	}

	// 3. อ่าน Bytes จากไฟล์ที่บันทึกไว้ใน Disk โดยตรง (การันตีได้ไฟล์ครบ ชัวร์ 100% ไม่เจอ EOF)
	imageBytes, err := os.ReadFile(filePath)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถอ่านไฟล์รูปภาพจากดิสก์ได้"})
		return
	}

	// 4. ตรวจหา MIME Type จาก Magic Bytes ของรูปภาพจริง
	detectedMime := http.DetectContentType(imageBytes)

	// Fallback ถ้าเช็กแล้วไม่ใช่ประเภท image/
	if !filepath.HasPrefix(detectedMime, "image/") {
		detectedMime = "image/jpeg"
	}

	fmt.Printf("📸 Uploaded Image File: %s | Size: %d bytes | Detected MIME: %s | Path: %s\n",
		fileHeader.Filename, len(imageBytes), detectedMime, filePath)

	// 5. สร้าง Context แยกต่างหากสำหรับยิงหา Gemini โดยกำหนดเวลาเผื่อไว้ 60 วินาที
	aiCtx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	// ส่ง aiCtx เข้าไปแทน ctx.Request.Context()
	result, err := c.geminiService.ExtractJobInfoFromImage(aiCtx, imageBytes, detectedMime)
	if err != nil {
		fmt.Printf("❌ Controller Error: %v\n", err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("เกิดข้อผิดพลาดในการสกัดข้อมูล: %v", err)})
		return
	}

	// 6. สร้าง Path URL ส่งกลับไปให้ Frontend แสดงผล preview
	imageURL := fmt.Sprintf("/uploads/jobs/%s", filename)

	ctx.JSON(http.StatusOK, gin.H{
		"status":    "success",
		"image_url": imageURL,
		"data":      result,
	})
}

// GenerateCriteria: สร้างเกณฑ์ประเมินจาก Job Title และ Description
func (c *JobController) GenerateCriteria(ctx *gin.Context) {
	if c.geminiService == nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Gemini Service ไม่ได้เปิดใช้งาน"})
		return
	}

	var req dto.GenerateCriteriaRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง กรุณาระบุ job_title และ job_description"})
		return
	}

	criteria, err := c.geminiService.GenerateCriteriaFromText(ctx.Request.Context(), req.JobTitle, req.JobDescription)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("เกิดข้อผิดพลาดในการสร้างเกณฑ์: %v", err)})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"status":   "success",
		"criteria": criteria,
	})
}

// CreateJob: รับข้อมูลที่ HR แก้ไขและยืนยันแล้ว บันทึกลง Database
func (c *JobController) CreateJob(ctx *gin.Context) {
	var jobReq entity.JobPosition
	if err := ctx.ShouldBindJSON(&jobReq); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("ข้อมูลไม่ถูกต้อง: %v", err)})
		return
	}

	if c.jobService == nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Job Service ไม่ได้ถูกตั้งค่า"})
		return
	}

	// ดึง UserID จาก Context (หากผ่าน JWT / Auth Middleware มา)
	if userID, exists := ctx.Get("userID"); exists {
		if uid, ok := userID.(uint); ok {
			jobReq.UserID = uid
		}
	}

	job, err := c.jobService.CreateJob(ctx.Request.Context(), &jobReq)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("ไม่สามารถบันทึกข้อมูลตำแหน่งงานได้: %v", err)})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"status":  "success",
		"message": "บันทึกข้อมูลตำแหน่งงานเรียบร้อยแล้ว",
		"data":    job,
	})
}
