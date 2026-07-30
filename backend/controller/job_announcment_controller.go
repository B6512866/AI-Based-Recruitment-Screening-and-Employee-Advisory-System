package controller

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"AI-Based-Recruitment-Screening-and-Employee-Advisory-System/backend/entity"

	"encoding/json"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"

	"AI-Based-Recruitment-Screening-and-Employee-Advisory-System/backend/services"
)

type JobAnnouncementController struct {
	db *gorm.DB
}

func NewJobAnnouncementController(db *gorm.DB) *JobAnnouncementController {
	return &JobAnnouncementController{
		db: db,
	}
}

// POST /api/job-positions/:id/announcements/upload
func (c *JobAnnouncementController) Upload(ctx *gin.Context) {
	// ==========================================
	// 1. ตรวจสอบ Job Position ID
	// ==========================================
	jobID, err := strconv.ParseUint(
		ctx.Param("id"),
		10,
		32,
	)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "ID ตำแหน่งงานไม่ถูกต้อง",
		})
		return
	}

	// ==========================================
	// 2. ตรวจสอบว่าตำแหน่งงานมีอยู่จริง
	// ==========================================
	var job entity.JobPosition

	if err := c.db.First(&job, uint(jobID)).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			ctx.JSON(http.StatusNotFound, gin.H{
				"error": "ไม่พบตำแหน่งงาน",
			})
			return
		}

		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "ไม่สามารถตรวจสอบตำแหน่งงานได้",
		})
		return
	}

	// ==========================================
	// 3. รับไฟล์จาก multipart/form-data
	// ==========================================
	file, err := ctx.FormFile("file")

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "กรุณาเลือกไฟล์ประกาศงาน",
		})
		return
	}

	// ==========================================
	// 4. ตรวจสอบขนาดไฟล์
	// จำกัด 10 MB
	// ==========================================
	const maxFileSize = 10 * 1024 * 1024

	if file.Size > maxFileSize {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "ขนาดไฟล์ต้องไม่เกิน 10 MB",
		})
		return
	}

	// ==========================================
	// 5. ตรวจสอบนามสกุลไฟล์
	// ==========================================
	extension := strings.ToLower(
		filepath.Ext(file.Filename),
	)

	allowedExtensions := map[string]bool{
		".pdf":  true,
		".jpg":  true,
		".jpeg": true,
		".png":  true,
	}

	if !allowedExtensions[extension] {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "รองรับเฉพาะไฟล์ PDF, JPG, JPEG และ PNG",
		})
		return
	}

	// ==========================================
	// 6. สร้างโฟลเดอร์ ถ้ายังไม่มี
	// ==========================================
	uploadDirectory := filepath.Join(
		"uploads",
		"job-announcements",
	)

	if err := os.MkdirAll(
		uploadDirectory,
		os.ModePerm,
	); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "ไม่สามารถสร้างโฟลเดอร์เก็บไฟล์ได้",
		})
		return
	}

	// ==========================================
	// 7. สร้างชื่อไฟล์ใหม่
	// ป้องกันชื่อไฟล์ซ้ำ
	// ==========================================
	newFileName := fmt.Sprintf(
		"job_%d_%d%s",
		jobID,
		time.Now().UnixNano(),
		extension,
	)

	filePath := filepath.Join(
		uploadDirectory,
		newFileName,
	)

	// ==========================================
	// 8. บันทึกไฟล์
	// ==========================================
	if err := ctx.SaveUploadedFile(
		file,
		filePath,
	); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "ไม่สามารถบันทึกไฟล์ได้",
		})
		return
	}

	// ==========================================
	// 9. บันทึกข้อมูลลง Database
	// ==========================================
	announcement := entity.JobAnnouncement{
		JobPositionID: uint(jobID),
		FileName:      file.Filename,
		FilePath:      filePath,
		FileType:      strings.TrimPrefix(extension, "."),
		FileSize:      file.Size,
		Status:        "uploaded",
	}

	if err := c.db.Create(&announcement).Error; err != nil {
		// ถ้าบันทึก DB ไม่สำเร็จ
		// ลบไฟล์ที่เพิ่งอัปโหลดออก
		_ = os.Remove(filePath)

		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "ไม่สามารถบันทึกข้อมูลไฟล์ลงฐานข้อมูลได้",
		})
		return
	}

	// ==========================================
	// 10. ส่งผลลัพธ์กลับ
	// ==========================================
	ctx.JSON(http.StatusCreated, gin.H{
		"message": "อัปโหลดประกาศงานสำเร็จ",
		"data":    announcement,
	})
}

// GET /api/job-positions/:id/announcements
func (c *JobAnnouncementController) GetByJobPositionID(ctx *gin.Context) {
	jobID, err := strconv.ParseUint(
		ctx.Param("id"),
		10,
		32,
	)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "ID ตำแหน่งงานไม่ถูกต้อง",
		})
		return
	}

	// ตรวจสอบว่าตำแหน่งงานมีอยู่จริง
	var job entity.JobPosition

	if err := c.db.First(&job, uint(jobID)).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			ctx.JSON(http.StatusNotFound, gin.H{
				"error": "ไม่พบตำแหน่งงาน",
			})
			return
		}

		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "ไม่สามารถตรวจสอบตำแหน่งงานได้",
		})
		return
	}

	// ดึงไฟล์ทั้งหมดของตำแหน่งงาน
	var announcements []entity.JobAnnouncement

	if err := c.db.
		Where("job_position_id = ?", uint(jobID)).
		Order("created_at DESC").
		Find(&announcements).Error; err != nil {

		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "ไม่สามารถดึงรายการประกาศงานได้",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": announcements,
	})
}

// DELETE /api/job-announcements/:announcementId
func (c *JobAnnouncementController) Delete(ctx *gin.Context) {
	announcementID, err := strconv.ParseUint(
		ctx.Param("announcementId"),
		10,
		32,
	)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "ID ไฟล์ประกาศไม่ถูกต้อง",
		})
		return
	}

	// ค้นหาข้อมูลประกาศ
	var announcement entity.JobAnnouncement

	if err := c.db.
		First(&announcement, uint(announcementID)).
		Error; err != nil {

		if err == gorm.ErrRecordNotFound {
			ctx.JSON(http.StatusNotFound, gin.H{
				"error": "ไม่พบไฟล์ประกาศงาน",
			})
			return
		}

		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "ไม่สามารถค้นหาข้อมูลไฟล์ได้",
		})
		return
	}

	// ลบไฟล์จริงจากเครื่อง
	if announcement.FilePath != "" {
		if err := os.Remove(announcement.FilePath); err != nil {
			// ถ้าไฟล์ถูกลบไปแล้ว ให้ลบข้อมูล DB ต่อได้
			if !os.IsNotExist(err) {
				ctx.JSON(http.StatusInternalServerError, gin.H{
					"error": "ไม่สามารถลบไฟล์จากระบบได้",
				})
				return
			}
		}
	}

	// Soft Delete ข้อมูลจาก Database
	if err := c.db.Delete(&announcement).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "ไม่สามารถลบข้อมูลไฟล์ประกาศได้",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "ลบไฟล์ประกาศงานสำเร็จ",
	})
}
func (c *JobAnnouncementController) Analyze(ctx *gin.Context) {
	// รับ ID ของไฟล์ประกาศ
	announcementID, err := strconv.ParseUint(
		ctx.Param("announcementId"),
		10,
		32,
	)

	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "ID ไฟล์ประกาศไม่ถูกต้อง",
		})
		return
	}

	// ค้นหาไฟล์ประกาศใน Database
	var announcement entity.JobAnnouncement

	if err := c.db.
		First(&announcement, uint(announcementID)).
		Error; err != nil {

		if err == gorm.ErrRecordNotFound {
			ctx.JSON(http.StatusNotFound, gin.H{
				"error": "ไม่พบไฟล์ประกาศงาน",
			})
			return
		}

		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "ไม่สามารถค้นหาข้อมูลไฟล์ประกาศได้",
		})
		return
	}

	// ตอนนี้รองรับเฉพาะรูปภาพก่อน
	if announcement.FileType != "jpg" &&
		announcement.FileType != "jpeg" &&
		announcement.FileType != "png" {

		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "ขณะนี้ API วิเคราะห์รองรับ JPG, JPEG และ PNG",
		})
		return
	}

	// อ่านไฟล์จาก Path ที่บันทึกไว้
	fileData, err := os.ReadFile(
		announcement.FilePath,
	)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "ไม่สามารถอ่านไฟล์จากระบบได้",
		})
		return
	}

	// กำหนด MIME Type
	mimeType := ""

	switch announcement.FileType {
	case "jpg", "jpeg":
		mimeType = "image/jpeg"

	case "png":
		mimeType = "image/png"

	default:
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "ไม่รองรับประเภทไฟล์นี้",
		})
		return
	}

	// สร้าง Gemini Service
	geminiService, err := services.NewGeminiService()

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	// ส่งรูปภาพให้ Gemini วิเคราะห์
	result, err := geminiService.AnalyzeImage(
		fileData,
		mimeType,
	)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	// แปลงผลลัพธ์เป็น JSON String
	resultJSON, err := json.Marshal(result)

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "ไม่สามารถแปลงผลวิเคราะห์เป็น JSON ได้",
		})
		return
	}

	// บันทึกผลลง Database
	announcement.GeminiResult = string(resultJSON)

	announcement.Status = "analyzed"

	if err := c.db.Save(&announcement).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "ไม่สามารถบันทึกผลการวิเคราะห์ได้",
		})
		return
	}

	// ส่งผลกลับไป Frontend / Postman
	ctx.JSON(http.StatusOK, gin.H{
		"message": "Gemini วิเคราะห์ประกาศงานสำเร็จ",
		"data":    result,
	})
}
