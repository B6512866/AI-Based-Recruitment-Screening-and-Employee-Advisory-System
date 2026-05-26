package entity

import "time"

type Application struct {
    AppID       uint      `json:"app_id" gorm:"primaryKey;autoIncrement"`
    AppliedAt   time.Time `json:"applied_at"`
    Status      string    `json:"status"` // pending, approved, interview, rejected
    AIScore     float64   `json:"ai_score"`
    HrID        uint      `json:"hr_id"`
    ScreeningID uint      `json:"screening_id"`
}