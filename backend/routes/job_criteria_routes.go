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

	api.GET(
		"/job-positions/:id/criteria",
		middleware.AuthMiddleware(),
		jobCriteriaController.GetByJobPositionID,
	)

	api.POST(
		"/job-positions/:id/criteria",
		middleware.AuthMiddleware(),
		jobCriteriaController.Create,
	)

	api.PUT(
		"/job-criteria/:criteriaId",
		middleware.AuthMiddleware(),
		jobCriteriaController.Update,
	)

	api.DELETE(
		"/job-criteria/:criteriaId",
		middleware.AuthMiddleware(),
		jobCriteriaController.Delete,
	)

	// ==========================================
	// Criteria Options
	// ==========================================

	api.GET(
		"/job-criteria/:criteriaId/options",
		middleware.AuthMiddleware(),
		jobCriteriaOptionController.GetByCriteriaID,
	)

	api.POST(
		"/job-criteria/:criteriaId/options",
		middleware.AuthMiddleware(),
		jobCriteriaOptionController.Create,
	)

	api.PUT(
		"/job-criteria-options/:optionId",
		middleware.AuthMiddleware(),
		jobCriteriaOptionController.Update,
	)

	api.DELETE(
		"/job-criteria-options/:optionId",
		middleware.AuthMiddleware(),
		jobCriteriaOptionController.Delete,
	)
}
