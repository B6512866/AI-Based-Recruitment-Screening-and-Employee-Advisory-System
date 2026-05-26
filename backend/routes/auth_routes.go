package routes

import (
    "AI-Based-Recruitment-Screening-and-Employee-Advisory-System/backend/controller"
    "AI-Based-Recruitment-Screening-and-Employee-Advisory-System/backend/services"
    "github.com/gin-gonic/gin"
    "gorm.io/gorm"
)

func AuthRoutes(api *gin.RouterGroup, db *gorm.DB) {
    authService := services.NewAuthService(db)
    authController := controller.NewAuthController(authService)

    auth := api.Group("/auth")
    {
        auth.POST("/register", authController.RegisterHR)
        auth.POST("/login", authController.Login)
    }
}