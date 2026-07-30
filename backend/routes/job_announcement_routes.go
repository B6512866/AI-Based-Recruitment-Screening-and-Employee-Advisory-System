package routes

import (
	"AI-Based-Recruitment-Screening-and-Employee-Advisory-System/backend/controller"
	"AI-Based-Recruitment-Screening-and-Employee-Advisory-System/backend/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func JobAnnouncementRoutes(
	api *gin.RouterGroup,
	db *gorm.DB,
) {
	jobAnnouncementController :=
		controller.NewJobAnnouncementController(db)

	// อัปโหลดไฟล์ประกาศ
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

	// ลบไฟล์ประกาศ
	api.DELETE(
		"/job-announcements/:announcementId",
		middleware.AuthMiddleware(),
		jobAnnouncementController.Delete,
	)
	api.POST(
		"/job-announcements/:announcementId/analyze",
		middleware.AuthMiddleware(),
		jobAnnouncementController.Analyze,
	)
}
