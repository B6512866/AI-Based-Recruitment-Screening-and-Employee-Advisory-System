package entity

import "gorm.io/gorm"

type JobCriteria struct {
	gorm.Model

	// ตำแหน่งงานที่เกณฑ์นี้อยู่
	JobPositionID uint `json:"job_position_id" gorm:"not null;index"`

	// หมวดของเกณฑ์
	// ตัวอย่าง:
	// Hard Skill
	// Soft Skill
	// Experience
	// Education
	// Other
	Category string `json:"category" gorm:"default:'Other'"`

	// ชื่อเกณฑ์หลัก
	// ตัวอย่าง:
	// วุฒิการศึกษา
	// ประสบการณ์ด้าน Software Testing
	// ความสามารถด้าน API Testing
	Name string `json:"name" gorm:"not null"`

	// รายละเอียดของเกณฑ์
	Description string `json:"description" gorm:"type:text"`

	// น้ำหนักของเกณฑ์หลัก
	// ใช้สำหรับ AI วิเคราะห์ความสำคัญของเกณฑ์
	Weight float64 `json:"weight" gorm:"not null;default:0"`

	// เกณฑ์บังคับหรือไม่
	IsRequired bool `json:"is_required" gorm:"default:false"`

	// คะแนนเต็มของเกณฑ์นี้
	// ตัวอย่าง:
	// วุฒิการศึกษาเต็ม 20 คะแนน
	MaxScore float64 `json:"max_score" gorm:"not null;default:0"`

	// ความสัมพันธ์กับตำแหน่งงาน
	JobPosition JobPosition `json:"-" gorm:"foreignKey:JobPositionID"`

	// ตัวเลือกคะแนนที่ HR เพิ่มเอง
	Options []JobCriteriaOption `json:"options" gorm:"foreignKey:JobCriteriaID"`
}
