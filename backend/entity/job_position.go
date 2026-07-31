package entity

import "gorm.io/gorm"

type JobPosition struct {
	gorm.Model

	// ข้อมูลตำแหน่งงาน
	Title       string `json:"title" gorm:"not null"`
	Department  string `json:"department"`
	Location    string `json:"location"`
	Salary      string `json:"salary"`
	Type        string `json:"type"`
	Benefits    string `json:"benefits"`
	ContactInfo string `json:"contact_info"`

	// รายละเอียดตำแหน่งงาน
	Description string `json:"description" gorm:"type:text"`

	// เก็บคุณสมบัติเดิมแบบข้อความ
	// ใช้สำหรับรองรับข้อมูลเก่าที่มีอยู่แล้ว
	Criteria string `json:"criteria" gorm:"type:text"`

	// สถานะตำแหน่งงาน
	Status string `json:"status" gorm:"default:'เปิดรับสมัคร'"`

	// เจ้าของตำแหน่งงาน
	UserID uint `json:"user_id"`
	User   User `json:"-" gorm:"foreignKey:UserID"`

	// รูปประกาศงานที่ HR อัปโหลด
	Announcements []JobAnnouncement `json:"announcements" gorm:"foreignKey:JobPositionID"`

	// หัวข้อเกณฑ์ที่ Gemini วิเคราะห์ และ HR แก้ไข
	CriteriaItems []JobCriteria `json:"criteria_items" gorm:"foreignKey:JobPositionID"`
}
