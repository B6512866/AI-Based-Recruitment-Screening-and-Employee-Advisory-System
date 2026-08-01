package entity

import "gorm.io/gorm"

type JobPosition struct {
	gorm.Model

	// ข้อมูลตำแหน่งงานพื้นฐาน
	Title       string `json:"title" gorm:"not null"`
	Department  string `json:"department"`
	Location    string `json:"location"`
	Salary      string `json:"salary"`
	Type        string `json:"type"` // Employment Type (Full-time, Part-time ฯลฯ)
	Benefits    string `json:"benefits"`
	ContactInfo string `json:"contact_info"`

	// รายละเอียดตำแหน่งงาน
	Description string `json:"description" gorm:"type:text"`
	Criteria    string `json:"criteria" gorm:"type:text"` // สำหรับเก็บ Raw text หรือ JSON criteria ของตำแหน่งงาน

	// เก็บ รายละเอียด/หน้าที่/ทักษะ ที่ Gemini สกัดมาเป็น JSON หรือ Text Block
	Responsibilities string `json:"responsibilities" gorm:"type:text"`
	Requirements     string `json:"requirements" gorm:"type:text"`
	TechnicalSkills  string `json:"technical_skills" gorm:"type:text"`
	SoftSkills       string `json:"soft_skills" gorm:"type:text"`
	Education        string `json:"education"`
	Experience       string `json:"experience"`

	// สถานะตำแหน่งงาน
	Status string `json:"status" gorm:"default:'เปิดรับสมัคร'"`

	// เจ้าของตำแหน่งงาน
	UserID uint `json:"user_id"`
	User   User `json:"-" gorm:"foreignKey:UserID"`

	// รูปประกาศงานที่ HR อัปโหลด
	Announcements []JobAnnouncement `json:"announcements" gorm:"foreignKey:JobPositionID;constraint:OnDelete:CASCADE"`

	// เกณฑ์ Rubric ทั้งหมดของตำแหน่งงานนี้
	CriteriaItems []JobCriteria `json:"criteria_items" gorm:"foreignKey:JobPositionID;constraint:OnDelete:CASCADE"`

	// ใบสมัครที่เข้ามาในตำแหน่งนี้
	Applications []Application `json:"applications" gorm:"foreignKey:JobPositionID;constraint:OnDelete:CASCADE"`
}
