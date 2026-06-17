package config

import (
	"AI-Based-Recruitment-Screening-and-Employee-Advisory-System/backend/entity"
	"log"
)

func SeedAllData() {
	SeedRoles()
	SeedUsers()
	SeedCandidate()
	SeedApplication()
	SeedAIScreening()
	SeedResumes()
	SeedKnowledgeBase()
	SeedChatMessage()
}

func SeedRoles() {
	roles := []entity.Role{
		{Name: "HRManager"},
		{Name: "Employee"},
	}

	for _, role := range roles {
		var count int64
		DB.Model(&entity.Role{}).Where("name = ?", role.Name).Count(&count)
		if count == 0 {
			DB.Create(&role)
		}
	}
}

func SeedUsers() {
	var hrRole, empRole entity.Role

	if err := DB.Where("name = ?", "HRManager").First(&hrRole).Error; err != nil {
		log.Println("Role HRManager not found, run SeedRoles() first")
		return
	}
	if err := DB.Where("name = ?", "Employee").First(&empRole).Error; err != nil {
		log.Println("Role Employee not found, run SeedRoles() first")
		return
	}

	hashedPassword, err := HashPassword("password123")
	if err != nil {
		log.Println("HashPassword failed:", err)
		return
	}

	users := []entity.User{
		{
			FirstName: "Admin",
			LastName:  "HR",
			Email:     "hr@gmail.com",
			Password:  hashedPassword,
			RoleID:    hrRole.ID,
		},
		{
			FirstName:  "John",
			LastName:   "Employee",
			Email:      "test@gmail.com",
			Password:   hashedPassword,
			RoleID:     empRole.ID,
			Department: "IT",
		},
	}

	for _, user := range users {
		var existing entity.User
		result := DB.Where("email = ?", user.Email).First(&existing)

		if result.Error != nil {
			// ไม่มี user → สร้างใหม่
			if err := DB.Create(&user).Error; err != nil {
				log.Printf("Create user %s failed: %v", user.Email, err)
			} else {
				log.Printf("✅ Created: %s", user.Email)
			}
		} else {
			// มีอยู่แล้ว → update password และ role
			if err := DB.Model(&existing).Updates(map[string]interface{}{
				"password": user.Password,
				"role_id":  user.RoleID,
			}).Error; err != nil {
				log.Printf("Update user %s failed: %v", user.Email, err)
			} else {
				log.Printf("✅ Updated: %s", user.Email)
			}
		}
	}
}

func SeedCandidate()     {}
func SeedApplication()   {}
func SeedAIScreening()   {}
func SeedResumes()       {}
func SeedKnowledgeBase() {}
func SeedChatMessage()   {}
