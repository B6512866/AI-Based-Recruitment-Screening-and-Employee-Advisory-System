package entity

import "gorm.io/gorm"

type JobPosition struct {
	gorm.Model
	Title       string          `json:"title" gorm:"not null"`
	Department  string          `json:"department"`
	Location    string          `json:"location"`
	Salary      string          `json:"salary"`
	Type        string          `json:"type"`         // e.g. งานเต็มเวลา, สัญญาจ้าง, ฝึกงาน
	Benefits    string          `json:"benefits"`     // สวัสดิการ
	ContactInfo string          `json:"contact_info"` // ข้อมูลติดต่อ/วิธีการสมัคร
	Description string          `json:"description" gorm:"type:text"`
	Criteria    []MainCriterion `json:"criteria" gorm:"foreignKey:JobPositionID;constraint:OnDelete:CASCADE;"`
	ImageURL    string          `json:"image_url"`
	Status      string          `json:"status" gorm:"default:'เปิดรับสมัคร'"` // เปิดรับสมัคร / ปิดรับสมัครแล้ว
	UserID      uint            `json:"user_id"`
	User        User            `gorm:"foreignKey:UserID"`
}

type MainCriterion struct {
	gorm.Model
	JobPositionID uint           `json:"job_position_id"`
	CriterionID   string         `json:"id"` // e.g. "c1"
	Title         string         `json:"title"`
	Weight        float64        `json:"weight"`
	SubCriteria   []SubCriterion `json:"sub_criteria" gorm:"foreignKey:MainCriterionID;constraint:OnDelete:CASCADE;"`
}

type SubCriterion struct {
	gorm.Model
	MainCriterionID uint    `json:"main_criterion_id"`
	SubCriterionID  string  `json:"id"` // e.g. "s1_1"
	Title           string  `json:"title"`
	Description     string  `json:"description" gorm:"type:text"`
	Weight          float64 `json:"weight"`
}
