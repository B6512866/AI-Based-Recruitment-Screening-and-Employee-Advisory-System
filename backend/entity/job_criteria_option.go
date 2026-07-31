package entity

import "gorm.io/gorm"

type JobCriteriaOption struct {
	gorm.Model

	// เกณฑ์หลักที่ตัวเลือกนี้อยู่ภายใต้
	JobCriteriaID uint `json:"job_criteria_id" gorm:"not null;index"`

	// ตัวเลือกที่ HR กำหนดเอง
	// ตัวอย่าง:
	// "จบ IT"
	// "จบ Data Science"
	// "จบวิศวกรรมคอมพิวเตอร์"
	Name string `json:"name" gorm:"not null"`

	// รายละเอียดเพิ่มเติม
	Description string `json:"description" gorm:"type:text"`

	// คะแนนของตัวเลือก
	Score float64 `json:"score" gorm:"not null;default:0"`

	// ใช้งานหรือไม่
	IsActive bool `json:"is_active" gorm:"default:true"`

	// ความสัมพันธ์กับ JobCriteria
	JobCriteria JobCriteria `json:"-" gorm:"foreignKey:JobCriteriaID"`
}
