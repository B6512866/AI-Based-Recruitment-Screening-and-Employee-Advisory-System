package entity

import "gorm.io/gorm"

type JobCriteriaOption struct {
	gorm.Model

	// เกณฑ์หลักที่ตัวเลือกนี้อยู่ภายใต้
	JobCriteriaID uint `json:"job_criteria_id" gorm:"not null;index"`

	// ชื่อระดับ/ชื่อตัวเลือก (เช่น Excellent, Good, Pass, Fail)
	Name string `json:"name" gorm:"not null"`

	// ระดับคะแนน (กรณีเรียกเป็น Level)
	Level string `json:"level"`

	// รายละเอียดเพิ่มเติมของตัวเลือก
	Description string `json:"description" gorm:"type:text"`

	// เงื่อนไขในการได้ระดับคะแนนนี้
	Condition string `json:"condition" gorm:"type:text"`

	// คะแนนของระดับนี้
	Score float64 `json:"score" gorm:"not null;default:0"`

	// สถานะการใช้งาน
	IsActive bool `json:"is_active" gorm:"default:true"`

	// ความสัมพันธ์กับ JobCriteria
	JobCriteria JobCriteria `json:"-" gorm:"foreignKey:JobCriteriaID"`
}
