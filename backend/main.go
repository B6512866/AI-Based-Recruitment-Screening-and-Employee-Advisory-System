package main

import (
	"fmt"
	"os"

	"AI-Based-Recruitment-Screening-and-Employee-Advisory-System/backend/config"
	"AI-Based-Recruitment-Screening-and-Employee-Advisory-System/backend/routes"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load()

	// hardcode ชั่วคราว
	os.Setenv("DB_HOST", "127.0.0.1")
	os.Setenv("DB_PORT", "5432")
	os.Setenv("DB_USER", "postgres")
	os.Setenv("DB_PASSWORD", "postgres123")
	os.Setenv("DB_NAME", "hr_system")
	os.Setenv("JWT_SECRET", "mysecretkey123")

	fmt.Println("HOST:", os.Getenv("DB_HOST"))
	fmt.Println("PORT:", os.Getenv("DB_PORT"))
	fmt.Println("NAME:", os.Getenv("DB_NAME"))

	config.ConnectDatabase()

	r := gin.Default()

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	api := r.Group("/api")
	{
		routes.AuthRoutes(api, config.DB)
	}

	fmt.Println("Server running on port: 8080")
	r.Run(":8080")
}