package config

import (
	"fmt"
	"os"

	"AI-Based-Recruitment-Screening-and-Employee-Advisory-System/backend/entity"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase() {
	host := os.Getenv("DB_HOST")
	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	dbname := os.Getenv("DB_NAME")
	port := os.Getenv("DB_PORT")

	fmt.Println("Connecting to:", host, port, user, dbname)

	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=Asia/Bangkok",
		host, user, password, dbname, port,
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		panic("Failed to connect database: " + err.Error())
	}

	err = db.AutoMigrate(
		&entity.HRManager{},
		&entity.Candidate{},
		&entity.Application{},
		&entity.AIScreening{},
		&entity.GmailApplication{},
		&entity.KnowledgeBase{},
		&entity.ChatMessage{},
		&entity.Employee{},
		&entity.Report{},
	)
	if err != nil {
		panic("AutoMigrate failed: " + err.Error())
	}

	fmt.Println("Database connected!")
	DB = db
}