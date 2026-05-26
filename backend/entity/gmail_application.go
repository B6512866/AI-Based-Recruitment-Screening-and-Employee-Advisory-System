package entity

import "time"

type GmailApplication struct {
    GmailID     uint      `json:"gmail_id" gorm:"primaryKey;autoIncrement"`
    SenderEmail string    `json:"sender_email"`
    Body        string    `json:"body"`
    ReceivedAt  time.Time `json:"received_at"`
    HrID        uint      `json:"hr_id"`
    ScreeningID uint      `json:"screening_id"`
}