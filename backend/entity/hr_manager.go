package entity

import "time"

type HRManager struct {
    HrID      uint      `json:"hr_id" gorm:"primaryKey;autoIncrement"`
    FirstName string    `json:"first_name"`
    LastName  string    `json:"last_name"`
    Email     string    `json:"email" gorm:"unique"`
    Password  string    `json:"password"`
    CreatedAt time.Time `json:"created_at"`
}