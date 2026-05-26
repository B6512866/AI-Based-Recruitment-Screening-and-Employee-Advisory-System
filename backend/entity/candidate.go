package entity

type Candidate struct {
    ApplicantID  uint    `json:"applicant_id" gorm:"primaryKey;autoIncrement"`
    FirstName    string  `json:"first_name"`
    LastName     string  `json:"last_name"`
    Email        string  `json:"email"`
    Phone        string  `json:"phone"`
    Skills       string  `json:"skills"`
    Position     string  `json:"position"`
    ResumeURL    string  `json:"resume_url"`
    Score        float64 `json:"score"`
    AppID        uint    `json:"app_id"`
    ScreeningID  uint    `json:"screening_id"`
}