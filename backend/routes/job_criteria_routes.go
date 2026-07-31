package routes

import (
	"AI-Based-Recruitment-Screening-and-Employee-Advisory-System/backend/controller"
	"AI-Based-Recruitment-Screening-and-Employee-Advisory-System/backend/middleware"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func JobCriteriaRoutes(
	api *gin.RouterGroup,
	db *gorm.DB,
) {
	jobCriteriaController :=
		controller.NewJobCriteriaController(db)

	// =====================================================
	// GET เกณฑ์ทั้งหมดของตำแหน่งงาน
	// GET /api/job-positions/:id/criteria
	// =====================================================

	api.GET(
		"/job-positions/:id/criteria",
		middleware.AuthMiddleware(),
		jobCriteriaController.GetByJobPositionID,
	)

	// =====================================================
	// เพิ่มเกณฑ์ใหม่
	// POST /api/job-positions/:id/criteria
	// =====================================================

	api.POST(
		"/job-positions/:id/criteria",
		middleware.AuthMiddleware(),
		jobCriteriaController.Create,
	)

	// =====================================================
	// แก้ไขเกณฑ์
	// PUT /api/job-criteria/:criteriaId
	// =====================================================

	api.PUT(
		"/job-criteria/:criteriaId",
		middleware.AuthMiddleware(),
		jobCriteriaController.Update,
	)

	// =====================================================
	// ลบเกณฑ์
	// DELETE /api/job-criteria/:criteriaId
	// =====================================================

	api.DELETE(
		"/job-criteria/:criteriaId",
		middleware.AuthMiddleware(),
		jobCriteriaController.Delete,
	)
}
