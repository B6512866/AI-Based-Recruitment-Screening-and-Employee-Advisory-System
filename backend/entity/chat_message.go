package entity

import "time"

type ChatMessage struct {
    MsgID     uint      `json:"msg_id" gorm:"primaryKey;autoIncrement"`
    Question  string    `json:"question"`
    Answer    string    `json:"answer"`
    SourceDoc string    `json:"source_doc"`
    CreatedAt time.Time `json:"created_at"`
    EmpID     uint      `json:"emp_id"`
}