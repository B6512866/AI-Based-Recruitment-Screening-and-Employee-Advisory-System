package routes

import (
	"AI-Based-Recruitment-Screening-and-Employee-Advisory-System/backend/controller"
	"AI-Based-Recruitment-Screening-and-Employee-Advisory-System/backend/middleware"
	"AI-Based-Recruitment-Screening-and-Employee-Advisory-System/backend/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func JobAnnouncementRoutes(
	api *gin.RouterGroup,
	db *gorm.DB,
) {
	// สร้าง Gemini Service
	geminiService, err := services.NewGeminiService()
	if err != nil {
		panic("ไม่สามารถสร้าง Gemini Service ได้: " + err.Error())
	}

	// ส่ง Gemini Service เข้า JobAnnouncementController
	jobAnnouncementController :=
		controller.NewJobAnnouncementController(
			db,
			geminiService,
		)

	// อัปโหลดไฟล์ประกาศงาน
	api.POST(
		"/job-positions/:id/announcements/upload",
		middleware.AuthMiddleware(),
		jobAnnouncementController.Upload,
	)

	// ดูไฟล์ประกาศทั้งหมดของตำแหน่งงาน
	api.GET(
		"/job-positions/:id/announcements",
		middleware.AuthMiddleware(),
		jobAnnouncementController.GetByJobPositionID,
	)

	// ลบไฟล์ประกาศงาน
	api.DELETE(
		"/job-announcements/:announcementId",
		middleware.AuthMiddleware(),
		jobAnnouncementController.Delete,
	)

	// วิเคราะห์ประกาศงานด้วย Gemini
	api.POST(
		"/job-announcements/:announcementId/analyze",
		middleware.AuthMiddleware(),
		jobAnnouncementController.Analyze,
	)
	api.GET(
		"/job-announcements/:announcementId/image",
		middleware.AuthMiddleware(),
		jobAnnouncementController.GetAnnouncementImage,
	)
}
