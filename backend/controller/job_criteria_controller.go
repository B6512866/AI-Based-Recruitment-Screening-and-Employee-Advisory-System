package controller

import (
	"net/http"
	"strconv"

	"AI-Based-Recruitment-Screening-and-Employee-Advisory-System/backend/entity"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type JobCriteriaController struct {
	db *gorm.DB
}

func NewJobCriteriaController(db *gorm.DB) *JobCriteriaController {
	return &JobCriteriaController{
		db: db,
	}
}

// GET /api/job-positions/:id/criteria
func (c *JobCriteriaController) GetByJobPositionID(ctx *gin.Context) {
	jobID, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID ตำแหน่งงานไม่ถูกต้อง"})
		return
	}

	var job entity.JobPosition
	if err := c.db.First(&job, uint(jobID)).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบตำแหน่งงาน"})
		return
	}

	var criteria []entity.JobCriteria
	if err := c.db.Where("job_position_id = ?", uint(jobID)).
		Order("created_at ASC").
		Find(&criteria).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงเกณฑ์การประเมินได้"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": criteria})
}

// POST /api/job-positions/:id/criteria
func (c *JobCriteriaController) Create(ctx *gin.Context) {
	jobID, err := strconv.ParseUint(ctx.Param("id"), 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID ตำแหน่งงานไม่ถูกต้อง"})
		return
	}

	var job entity.JobPosition
	if err := c.db.First(&job, uint(jobID)).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบตำแหน่งงาน"})
		return
	}

	var req struct {
		Name        string  `json:"name"`
		Description string  `json:"description"`
		Weight      float64 `json:"weight"`
		MaxScore    float64 `json:"max_score"`
		IsRequired  bool    `json:"is_required"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "รูปแบบข้อมูลไม่ถูกต้อง"})
		return
	}

	if req.Name == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาระบุชื่อเกณฑ์"})
		return
	}

	if req.Weight < 0 || req.Weight > 100 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "น้ำหนักคะแนนต้องอยู่ระหว่าง 0 ถึง 100"})
		return
	}

	criteria := entity.JobCriteria{
		JobPositionID: uint(jobID),
		Name:          req.Name,
		Description:   req.Description,
		Weight:        req.Weight,
		MaxScore:      req.MaxScore,
		IsRequired:    req.IsRequired,
	}

	if err := c.db.Create(&criteria).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถเพิ่มเกณฑ์การประเมินได้"})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{
		"message": "เพิ่มเกณฑ์การประเมินสำเร็จ",
		"data":    criteria,
	})
}

// PUT /api/job-criteria/:criteriaId
func (c *JobCriteriaController) Update(ctx *gin.Context) {
	criteriaID, err := strconv.ParseUint(ctx.Param("criteriaId"), 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID เกณฑ์ไม่ถูกต้อง"})
		return
	}

	var criteria entity.JobCriteria
	if err := c.db.First(&criteria, uint(criteriaID)).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบเกณฑ์การประเมิน"})
		return
	}

	var req struct {
		Name        string  `json:"name"`
		Description string  `json:"description"`
		Weight      float64 `json:"weight"`
		MaxScore    float64 `json:"max_score"`
		IsRequired  bool    `json:"is_required"`
	}

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "รูปแบบข้อมูลไม่ถูกต้อง"})
		return
	}

	if req.Name == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "กรุณาระบุชื่อเกณฑ์"})
		return
	}

	if req.Weight < 0 || req.Weight > 100 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "น้ำหนักคะแนนต้องอยู่ระหว่าง 0 ถึง 100"})
		return
	}

	updates := map[string]interface{}{
		"name":        req.Name,
		"description": req.Description,
		"weight":      req.Weight,
		"is_required": req.IsRequired,
		"max_score":   req.MaxScore,
	}

	if err := c.db.Model(&criteria).Updates(updates).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถแก้ไขเกณฑ์การประเมินได้"})
		return
	}

	_ = c.db.First(&criteria, uint(criteriaID))

	ctx.JSON(http.StatusOK, gin.H{
		"message": "แก้ไขเกณฑ์การประเมินสำเร็จ",
		"data":    criteria,
	})
}

// DELETE /api/job-criteria/:criteriaId
func (c *JobCriteriaController) Delete(ctx *gin.Context) {
	criteriaID, err := strconv.ParseUint(ctx.Param("criteriaId"), 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID เกณฑ์ไม่ถูกต้อง"})
		return
	}

	var criteria entity.JobCriteria
	if err := c.db.First(&criteria, uint(criteriaID)).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบเกณฑ์การประเมิน"})
		return
	}

	// ลบ Options ย่อยของเกณฑ์นี้ออกก่อนลบเกณฑ์หลัก
	_ = c.db.Where("job_criteria_id = ?", criteria.ID).Delete(&entity.JobCriteriaOption{}).Error

	if err := c.db.Delete(&criteria).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถลบเกณฑ์การประเมินได้"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "ลบเกณฑ์การประเมินสำเร็จ"})
}

type AIAnalysisOptionPayload struct {
	Level     string  `json:"level"`
	Condition string  `json:"condition"`
	Score     float64 `json:"score"`
}

type AIAnalysisCriteriaPayload struct {
	Category    string                    `json:"category"`
	Description string                    `json:"description"`
	Weight      float64                   `json:"weight"`
	MaxScore    float64                   `json:"max_score"`
	Options     []AIAnalysisOptionPayload `json:"options"`
}

type AIAnalysisResponse struct {
	JobPositionID int                         `json:"job_position_id"`
	JobTitle      string                      `json:"job_title"`
	Criteria      []AIAnalysisCriteriaPayload `json:"evaluation_criteria"`
}

func (c *JobCriteriaController) GetAssessmentDataByPositionID(ctx *gin.Context) {
	positionID := ctx.Param("id")

	var jobPosition entity.JobPosition
	if err := c.db.First(&jobPosition, positionID).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบข้อมูลตำแหน่งงาน"})
		return
	}

	var criteriaList []entity.JobCriteria
	if err := c.db.Preload("Options").Where("job_position_id = ?", positionID).Find(&criteriaList).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลเกณฑ์การประเมินได้"})
		return
	}

	var aiCriteriaList []AIAnalysisCriteriaPayload
	for _, crit := range criteriaList {
		var aiOptions []AIAnalysisOptionPayload
		for _, opt := range crit.Options {
			if opt.IsActive {
				condVal := opt.Condition
				if condVal == "" {
					condVal = opt.Description
				}

				aiOptions = append(aiOptions, AIAnalysisOptionPayload{
					Level:     opt.Name,
					Condition: condVal,
					Score:     opt.Score,
				})
			}
		}

		aiCriteriaList = append(aiCriteriaList, AIAnalysisCriteriaPayload{
			Category:    crit.Category,
			Description: crit.Description,
			Weight:      crit.Weight,
			MaxScore:    crit.MaxScore,
			Options:     aiOptions,
		})
	}

	ctx.JSON(http.StatusOK, gin.H{
		"status": "success",
		"data": AIAnalysisResponse{
			JobPositionID: int(jobPosition.ID),
			JobTitle:      jobPosition.Title,
			Criteria:      aiCriteriaList,
		},
	})
}
