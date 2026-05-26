package entity

import "time"

type Report struct {
    ReportID    uint      `json:"report_id" gorm:"primaryKey;autoIncrement"`
    Type        string    `json:"type"`
    GeneratedAt time.Time `json:"generated_at"`
    HrID        uint      `json:"hr_id"`
}