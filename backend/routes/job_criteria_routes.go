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
	controller := controller.NewJobCriteriaController(
		db,
	)

	// เกณฑ์ของตำแหน่งงาน
	api.GET(
		"/job-positions/:id/criteria",
		middleware.AuthMiddleware(),
		controller.GetByJobPositionID,
	)

	api.POST(
		"/job-positions/:id/criteria",
		middleware.AuthMiddleware(),
		controller.Create,
	)

	// แก้ไขและลบเกณฑ์
	api.PUT(
		"/job-criteria/:criteriaId",
		middleware.AuthMiddleware(),
		controller.Update,
	)

	api.DELETE(
		"/job-criteria/:criteriaId",
		middleware.AuthMiddleware(),
		controller.Delete,
	)
}
