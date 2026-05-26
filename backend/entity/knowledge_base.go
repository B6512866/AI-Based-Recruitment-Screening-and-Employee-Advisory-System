package entity

import "time"

type KnowledgeBase struct {
    DocID      uint      `json:"doc_id" gorm:"primaryKey;autoIncrement"`
    Filename   string    `json:"filename"`
    Content    string    `json:"content"`
    VectorID   string    `json:"vector_id"`
    UploadedAt time.Time `json:"uploaded_at"`
    HrID       uint      `json:"hr_id"`
}