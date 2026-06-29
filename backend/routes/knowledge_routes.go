package routes

import (
	"AI-Based-Recruitment-Screening-and-Employee-Advisory-System/backend/controller"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

func KnowledgeRoutes(api *gin.RouterGroup, db *gorm.DB) {
	knowledgeController := controller.NewKnowledgeController(db)

	k := api.Group("/knowledge")
	{
		k.GET("", knowledgeController.GetAll)
		k.GET("/:id", knowledgeController.GetByID)
		k.POST("", knowledgeController.Create)
		k.PUT("/:id", knowledgeController.Update)
		k.DELETE("/:id", knowledgeController.Delete)
	}
}
