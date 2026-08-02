package controller

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"AI-Based-Recruitment-Screening-and-Employee-Advisory-System/backend/entity"
	"AI-Based-Recruitment-Screening-and-Employee-Advisory-System/backend/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type JobAnnouncementController struct {
	db            *gorm.DB
	geminiService *services.GeminiService
}

func NewJobAnnouncementController(
	db *gorm.DB,
	geminiService *services.GeminiService,
) *JobAnnouncementController {
	return &JobAnnouncementController{
		db:            db,
		geminiService: geminiService,
	}
}

// POST /api/job-positions/:id/announcements/upload
func (c *JobAnnouncementController) Upload(ctx *gin.Context) {
	jobID, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID ตำแหน่งงานไม่ถูกต้อง"})
		return
	}

	var job entity.JobPosition
	if err := c.db.First(&job, uint(jobID)).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			ctx.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบตำแหน่งงาน"})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถตรวจสอบตำแหน่งงานได้"})
		return
	}

	file, err := ctx.FormFile("file")
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาเลือกไฟล์ประกาศงาน"})
		return
	}

	const maxFileSize = 10 * 1024 * 1024 // 10 MB
	if file.Size > maxFileSize {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ขนาดไฟล์ต้องไม่เกิน 10 MB"})
		return
	}

	extension := strings.ToLower(filepath.Ext(file.Filename))
	allowedExtensions := map[string]bool{
		".pdf":  true,
		".jpg":  true,
		".jpeg": true,
		".png":  true,
	}

	if !allowedExtensions[extension] {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "รองรับเฉพาะไฟล์ PDF, JPG, JPEG และ PNG"})
		return
	}

	uploadDirectory := filepath.Join("uploads", "job-announcements")
	if err := os.MkdirAll(uploadDirectory, os.ModePerm); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถสร้างโฟลเดอร์เก็บไฟล์ได้"})
		return
	}

	newFileName := fmt.Sprintf("job_%d_%d%s", jobID, time.Now().UnixNano(), extension)
	filePath := filepath.Join(uploadDirectory, newFileName)

	if err := ctx.SaveUploadedFile(file, filePath); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถบันทึกไฟล์ได้"})
		return
	}

	announcement := entity.JobAnnouncement{
		JobPositionID: uint(jobID),
		FileName:      file.Filename,
		FilePath:      filePath,
		FileType:      strings.TrimPrefix(extension, "."),
		FileSize:      file.Size,
		Status:        "uploaded",
	}

	if err := c.db.Create(&announcement).Error; err != nil {
		_ = os.Remove(filePath)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถบันทึกข้อมูลไฟล์ลงฐานข้อมูลได้"})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"message": "อัปโหลดประกาศงานสำเร็จ",
		"data":    announcement,
	})
}

// GET /api/job-positions/:id/announcements
func (c *JobAnnouncementController) GetByJobPositionID(ctx *gin.Context) {
	jobID, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID ตำแหน่งงานไม่ถูกต้อง"})
		return
	}

	var job entity.JobPosition
	if err := c.db.First(&job, uint(jobID)).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			ctx.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบตำแหน่งงาน"})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถตรวจสอบตำแหน่งงานได้"})
		return
	}

	var announcements []entity.JobAnnouncement
	if err := c.db.Where("job_position_id = ?", uint(jobID)).
		Order("created_at DESC").
		Find(&announcements).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงรายการประกาศงานได้"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": announcements})
}

// DELETE /api/job-announcements/:announcementId
func (c *JobAnnouncementController) Delete(ctx *gin.Context) {
	announcementID, err := strconv.ParseUint(ctx.Param("announcementId"), 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID ไฟล์ประกาศไม่ถูกต้อง"})
		return
	}

	var announcement entity.JobAnnouncement
	if err := c.db.First(&announcement, uint(announcementID)).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			ctx.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบไฟล์ประกาศงาน"})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถค้นหาข้อมูลไฟล์ได้"})
		return
	}

	if announcement.FilePath != "" {
		safePath := filepath.Clean(announcement.FilePath)
		if err := os.Remove(safePath); err != nil && !os.IsNotExist(err) {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถลบไฟล์จากระบบได้"})
			return
		}
	}

	if err := c.db.Delete(&announcement).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถลบข้อมูลไฟล์ประกาศได้"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "ลบไฟล์ประกาศงานสำเร็จ"})
}

// POST /api/job-announcements/:announcementId/analyze
func (c *JobAnnouncementController) Analyze(ctx *gin.Context) {
	announcementID, err := strconv.ParseUint(ctx.Param("announcementId"), 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID ประกาศงานไม่ถูกต้อง"})
		return
	}

	var announcement entity.JobAnnouncement
	if err := c.db.First(&announcement, uint(announcementID)).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			ctx.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบไฟล์ประกาศงาน"})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถค้นหาข้อมูลไฟล์ได้"})
		return
	}

	fileType := strings.ToLower(announcement.FileType)
	allowedTypes := map[string]string{
		"jpg":  "image/jpeg",
		"jpeg": "image/jpeg",
		"png":  "image/png",
	}

	mimeType, exists := allowedTypes[fileType]
	if !exists {
		ctx.JSON(http.StatusBadRequest, gin.H{
			"error": "ขณะนี้ API วิเคราะห์รองรับเฉพาะไฟล์ JPG, JPEG และ PNG",
		})
		return
	}

	safePath := filepath.Clean(announcement.FilePath)
	fileData, err := os.ReadFile(safePath)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถอ่านไฟล์ประกาศงานได้"})
		return
	}

	result, err := c.geminiService.AnalyzeImage(fileData, mimeType)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	resultJSON, err := json.Marshal(result)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถแปลงผลการวิเคราะห์เป็น JSON ได้"})
		return
	}

	err = c.db.Transaction(func(tx *gorm.DB) error {
		announcement.GeminiResult = string(resultJSON)
		announcement.Status = "analyzed"
		if err := tx.Save(&announcement).Error; err != nil {
			return err
		}

		// อัปเดตข้อมูลรายละเอียด, สวัสดิการ และข้อมูลติดต่อ ลงใน JobPosition อัตโนมัติ[cite: 7]
		var jobPosition entity.JobPosition
		if err := tx.First(&jobPosition, announcement.JobPositionID).Error; err == nil {
			if result.Title != "" {
				jobPosition.Title = result.Title
			}
			if result.Department != "" {
				jobPosition.Department = result.Department
			}
			if result.Location != "" {
				jobPosition.Location = result.Location
			}
			if result.Salary != "" {
				jobPosition.Salary = result.Salary
			}
			if result.EmploymentType != "" {
				jobPosition.Type = result.EmploymentType
			}
			if result.Education != "" {
				jobPosition.Education = result.Education
			}
			if result.Experience != "" {
				jobPosition.Experience = result.Experience
			}

			jobPosition.Benefits = strings.Join(result.Benefits, "\n")
			jobPosition.ContactInfo = result.ContactInfo
			jobPosition.Description = strings.Join(result.Description, "\n")
			jobPosition.Responsibilities = strings.Join(result.Responsibilities, "\n")
			jobPosition.Requirements = strings.Join(result.Requirements, "\n")
			jobPosition.TechnicalSkills = strings.Join(result.TechnicalSkills, ", ")
			jobPosition.SoftSkills = strings.Join(result.SoftSkills, ", ")

			_ = tx.Save(&jobPosition).Error
		}

		// 1. ค้นหา Criteria ทั้งหมดก่อนเพื่อลบ Options ที่ผูกไว้ออกให้หมด (ป้องกัน Orphan Records)[cite: 7]
		var oldCriteriaList []entity.JobCriteria
		if err := tx.Where("job_position_id = ?", announcement.JobPositionID).Find(&oldCriteriaList).Error; err == nil {
			for _, oldCrit := range oldCriteriaList {
				_ = tx.Where("job_criteria_id = ?", oldCrit.ID).Delete(&entity.JobCriteriaOption{}).Error
			}
		}

		// 2. ลบ Criteria เก่า[cite: 7]
		if err := tx.Where("job_position_id = ?", announcement.JobPositionID).
			Delete(&entity.JobCriteria{}).Error; err != nil {
			return err
		}

		// 3. สร้าง Criteria + Options ใหม่[cite: 7]
		for _, item := range result.SuggestedCriteria {
			var options []entity.JobCriteriaOption
			var maxScore float64 = 0

			for _, rub := range item.SuggestedRubric {
				score := float64(rub.Score)
				if score > maxScore {
					maxScore = score
				}

				options = append(options, entity.JobCriteriaOption{
					Name:        rub.Level,
					Level:       rub.Level,
					Condition:   rub.Condition,
					Description: rub.Condition,
					Score:       score,
					IsActive:    true,
				})
			}

			if maxScore <= 0 {
				maxScore = 10
			}

			criteria := entity.JobCriteria{
				JobPositionID: announcement.JobPositionID,
				Category:      item.Category,
				Name:          item.Title,
				Description:   item.Description,
				IsRequired:    false,
				MaxScore:      maxScore,
				Options:       options,
			}

			if err := tx.Create(&criteria).Error; err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{
			"error": "ไม่สามารถบันทึกผลการวิเคราะห์ลงฐานข้อมูลได้",
		})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "Gemini วิเคราะห์และบันทึกเกณฑ์สำเร็จ",
		"data":    result,
	})
}
func (c *JobAnnouncementController) GetAnnouncementImage(ctx *gin.Context) {
	announcementID, err := strconv.ParseUint(ctx.Param("announcementId"), 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID ไฟล์ประกาศไม่ถูกต้อง"})
		return
	}

	var announcement entity.JobAnnouncement
	if err := c.db.First(&announcement, uint(announcementID)).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			ctx.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบไฟล์ประกาศงาน"})
			return
		}
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถค้นหาข้อมูลไฟล์ได้"})
		return
	}

	if announcement.FilePath == "" {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบเส้นทางไฟล์ในระบบ"})
		return
	}

	safePath := filepath.Clean(announcement.FilePath)
	if _, err := os.Stat(safePath); os.IsNotExist(err) {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบไฟล์รูปภาพบนเซิร์ฟเวอร์"})
		return
	}

	// ส่งไฟล์รูปภาพกลับไปให้ Client แสดงผล
	ctx.File(safePath)
}
