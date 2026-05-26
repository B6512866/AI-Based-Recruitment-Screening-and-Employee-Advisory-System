package entity

import "time"

type Employee struct {
    EmpID      uint      `json:"emp_id" gorm:"primaryKey;autoIncrement"`
    FirstName  string    `json:"first_name"`
    Department string    `json:"department"`
    Password   string    `json:"password"`
    HireDate   time.Time `json:"hire_date"`
}