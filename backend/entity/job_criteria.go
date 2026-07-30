package entity

import "gorm.io/gorm"

type JobCriteria struct {
	gorm.Model

	JobPositionID uint `json:"job_position_id" gorm:"not null;index"`

	Name string `json:"name" gorm:"not null"`

	Description string `json:"description" gorm:"type:text"`

	Weight float64 `json:"weight" gorm:"not null;default:0"`

	IsRequired bool `json:"is_required" gorm:"default:false"`

	JobPosition JobPosition `json:"-" gorm:"foreignKey:JobPositionID"`
}
