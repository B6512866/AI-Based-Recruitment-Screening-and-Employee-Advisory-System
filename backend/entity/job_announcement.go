package entity

import "gorm.io/gorm"

type JobAnnouncement struct {
	gorm.Model

	JobPositionID uint `json:"job_position_id"`

	JobPosition JobPosition `json:"-" gorm:"foreignKey:JobPositionID"`

	FileName string `json:"file_name"`

	FilePath string `json:"file_path"`

	FileType string `json:"file_type"`

	FileSize int64 `json:"file_size"`

	Status string `json:"status" gorm:"default:'uploaded'"`

	OCRText string `gorm:"type:text"`

	GeminiResult string `gorm:"type:text"`
}
