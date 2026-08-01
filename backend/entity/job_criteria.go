package entity

import "gorm.io/gorm"

type JobCriteria struct {
	gorm.Model

	// ตำแหน่งงานที่เกณฑ์นี้อยู่
	JobPositionID uint `json:"job_position_id" gorm:"not null;index"`

	// หมวดของเกณฑ์ (เช่น: technical_skills, experience, education, soft_skills, other)
	Category string `json:"category" gorm:"default:'other'"`

	// ชื่อเกณฑ์หลัก (เช่น: ความเชี่ยวชาญด้าน Golang, วุฒิการศึกษา)
	Name string `json:"name" gorm:"not null"`

	// รายละเอียดเพิ่มเติมของเกณฑ์นี้
	Description string `json:"description" gorm:"type:text"`

	// น้ำหนักคะแนน (%) ของเกณฑ์นี้
	Weight float64 `json:"weight" gorm:"default:0"`

	// เกณฑ์บังคับหรือไม่ (ถ้าเป็น true แล้วผู้สมัครได้ 0 คะแนน อาจจะตกทันที)
	IsRequired bool `json:"is_required" gorm:"default:false"`

	// คะแนนเต็มของเกณฑ์ข้อนี้
	MaxScore float64 `json:"max_score" gorm:"default:10"`

	// ความสัมพันธ์กับตำแหน่งงาน
	JobPosition JobPosition `json:"-" gorm:"foreignKey:JobPositionID"`

	// ตัวเลือกระดับคะแนน (Rubric Levels)
	Options []JobCriteriaOption `json:"options" gorm:"foreignKey:JobCriteriaID;constraint:OnDelete:CASCADE"`
}

func (j *JobCriteria) BeforeCreate(tx *gorm.DB) error {
	if j.MaxScore <= 0 {
		j.MaxScore = 10
	}
	return nil
}
