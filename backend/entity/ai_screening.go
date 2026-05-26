package entity

type AIScreening struct {
    ScreeningID uint    `json:"screening_id" gorm:"primaryKey;autoIncrement"`
    SkillScore  float64 `json:"skill_score"`
    Strengths   string  `json:"strengths"`
    ModelUsed   string  `json:"model_used"` // "llama3"
}