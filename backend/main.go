package main

import (
	"fmt"
	"log"
	"os"
	"os/exec"

	"AI-Based-Recruitment-Screening-and-Employee-Advisory-System/backend/config"
	"AI-Based-Recruitment-Screening-and-Employee-Advisory-System/backend/controller"
	"AI-Based-Recruitment-Screening-and-Employee-Advisory-System/backend/middleware"
	"AI-Based-Recruitment-Screening-and-Employee-Advisory-System/backend/routes"
	"AI-Based-Recruitment-Screening-and-Employee-Advisory-System/backend/services"

	"github.com/gin-gonic/gin"
)

func startTyphoonAI() {
	go func() {
		fmt.Println("🤖 Starting Typhoon AI Service on port 8000...")
		cmd := exec.Command("python", "-u", "-m", "uvicorn", "typhoon.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload")
		cmd.Stdout = os.Stdout
		cmd.Stderr = os.Stderr
		err := cmd.Run()
		if err != nil {
			log.Println("⚠️ Typhoon AI process ended or failed:", err)
		}
	}()
}

func main() {
	config.LoadEnv()
	config.ConnectDatabase()
	config.SeedAllData()

	geminiService, err := services.NewGeminiService(config.Env.GeminiAPIKey)
	if err != nil {
		log.Printf("⚠️ Warning: Gemini Service initialization failed: %v\n", err)
	} else {
		fmt.Println("✅ Gemini Vision Service initialized successfully!")
	}

	// 1. สร้าง JobService โดยส่ง config.DB เข้าไป
	jobService := services.NewJobService(config.DB)

	// 2. ส่งทั้ง geminiService และ jobService เข้า NewJobController (แก้ไขจุดนี้)
	jobController := controller.NewJobController(geminiService, jobService)

	startTyphoonAI()

	r := gin.Default()
	r.Use(middleware.CORSMiddleware())

	r.Static("/uploads/jobs", "./uploads/jobs")

	api := r.Group("/api")
	{
		api.POST("/upload", func(ctx *gin.Context) {
			// ...
		})

		routes.SetupJobRoutes(api, jobController)

		routes.AuthRoutes(api, config.DB)
		routes.KnowledgeRoutes(api, config.DB)
		routes.JobPositionRoutes(api, config.DB)
		routes.ChatRoutes(api, config.DB)
		routes.InterviewRoutes(api, config.DB)
	}

	fmt.Println("🚀 Server running on port:", config.Env.BackendPort)
	r.Run(":" + config.Env.BackendPort)
}
