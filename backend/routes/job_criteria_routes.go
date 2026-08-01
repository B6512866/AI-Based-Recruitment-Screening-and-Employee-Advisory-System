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

	jobCriteriaOptionController :=
		controller.NewJobCriteriaOptionController(db)

	// ==========================================
	// Job Criteria
	// ==========================================

	// GET: ดึงรายการเกณฑ์การประเมินตาม Job Position ID
	api.GET(
		"/job-positions/:id/criteria",
		middleware.AuthMiddleware(),
		jobCriteriaController.GetByJobPositionID,
	)

	// POST: สร้างเกณฑ์การประเมินใหม่
	api.POST(
		"/job-positions/:id/criteria",
		middleware.AuthMiddleware(),
		jobCriteriaController.Create,
	)

	// PUT: แก้ไขเกณฑ์การประเมิน
	api.PUT(
		"/job-criteria/:criteriaId",
		middleware.AuthMiddleware(),
		jobCriteriaController.Update,
	)

	// DELETE: ลบเกณฑ์การประเมิน
	api.DELETE(
		"/job-criteria/:criteriaId",
		middleware.AuthMiddleware(),
		jobCriteriaController.Delete,
	)

	// ==========================================
	// Criteria Options
	// ==========================================

	// GET: ดึงรายการเกณฑ์ย่อยตาม Criteria ID
	api.GET(
		"/job-criteria/:criteriaId/options",
		middleware.AuthMiddleware(),
		jobCriteriaOptionController.GetByCriteriaID,
	)

	// POST: สร้างเกณฑ์ย่อยใหม่
	api.POST(
		"/job-criteria/:criteriaId/options",
		middleware.AuthMiddleware(),
		jobCriteriaOptionController.Create,
	)

	// PUT: แก้ไขเกณฑ์ย่อย
	api.PUT(
		"/job-criteria-options/:optionId",
		middleware.AuthMiddleware(),
		jobCriteriaOptionController.Update,
	)

	// DELETE: ลบเกณฑ์ย่อย
	api.DELETE(
		"/job-criteria-options/:optionId",
		middleware.AuthMiddleware(),
		jobCriteriaOptionController.Delete,
	)

	api.GET(
		"/job-positions/:id/assessment-data",
		middleware.AuthMiddleware(), // หรือเอา AuthMiddleware ออกถ้าอยากลองยิงง่ายๆ ใน Postman
		jobCriteriaController.GetAssessmentDataByPositionID,
	)
}
