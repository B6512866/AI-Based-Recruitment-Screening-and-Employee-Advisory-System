package controller

import (
	"net/http"
	"strconv"
	"strings"

	"AI-Based-Recruitment-Screening-and-Employee-Advisory-System/backend/entity"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type JobCriteriaOptionController struct {
	db *gorm.DB
}

func NewJobCriteriaOptionController(
	db *gorm.DB,
) *JobCriteriaOptionController {
	return &JobCriteriaOptionController{
		db: db,
	}
}

// =====================================================
// GET /api/job-criteria/:criteriaId/options
// ดึงตัวเลือกคะแนนทั้งหมดของเกณฑ์
// =====================================================

func (c *JobCriteriaOptionController) GetByCriteriaID(
	ctx *gin.Context,
) {
	criteriaID, err := strconv.ParseUint(
		ctx.Param("criteriaId"),
		10,
		32,
	)

	if err != nil {
		ctx.JSON(
			http.StatusBadRequest,
			gin.H{
				"error": "ID เกณฑ์ไม่ถูกต้อง",
			},
		)
		return
	}

	var criteria entity.JobCriteria

	if err := c.db.First(
		&criteria,
		uint(criteriaID),
	).Error; err != nil {

		ctx.JSON(
			http.StatusNotFound,
			gin.H{
				"error": "ไม่พบเกณฑ์การประเมิน",
			},
		)
		return
	}

	var options []entity.JobCriteriaOption

	if err := c.db.
		Where(
			"job_criteria_id = ?",
			uint(criteriaID),
		).
		Order(
			"created_at ASC",
		).
		Find(
			&options,
		).Error; err != nil {

		ctx.JSON(
			http.StatusInternalServerError,
			gin.H{
				"error": "ไม่สามารถดึงตัวเลือกคะแนนได้",
			},
		)
		return
	}

	ctx.JSON(
		http.StatusOK,
		gin.H{
			"data": options,
		},
	)
}

// =====================================================
// POST /api/job-criteria/:criteriaId/options
// เพิ่มตัวเลือกคะแนน
// =====================================================

func (c *JobCriteriaOptionController) Create(
	ctx *gin.Context,
) {
	criteriaID, err := strconv.ParseUint(
		ctx.Param("criteriaId"),
		10,
		32,
	)

	if err != nil {
		ctx.JSON(
			http.StatusBadRequest,
			gin.H{
				"error": "ID เกณฑ์ไม่ถูกต้อง",
			},
		)
		return
	}

	var criteria entity.JobCriteria

	if err := c.db.First(
		&criteria,
		uint(criteriaID),
	).Error; err != nil {

		ctx.JSON(
			http.StatusNotFound,
			gin.H{
				"error": "ไม่พบเกณฑ์การประเมิน",
			},
		)
		return
	}

	var req struct {
		Name        string  `json:"name"`
		Description string  `json:"description"`
		Score       float64 `json:"score"`
		IsActive    bool    `json:"is_active"`
	}

	if err := ctx.ShouldBindJSON(
		&req,
	); err != nil {

		ctx.JSON(
			http.StatusBadRequest,
			gin.H{
				"error": "รูปแบบข้อมูลไม่ถูกต้อง",
			},
		)
		return
	}

	req.Name = strings.TrimSpace(
		req.Name,
	)

	if req.Name == "" {
		ctx.JSON(
			http.StatusBadRequest,
			gin.H{
				"error": "กรุณาระบุชื่อตัวเลือก",
			},
		)
		return
	}

	if req.Score < 0 {
		ctx.JSON(
			http.StatusBadRequest,
			gin.H{
				"error": "คะแนนต้องไม่ติดลบ",
			},
		)
		return
	}

	if criteria.MaxScore > 0 &&
		req.Score > criteria.MaxScore {

		ctx.JSON(
			http.StatusBadRequest,
			gin.H{
				"error": "คะแนนตัวเลือกต้องไม่เกินคะแนนเต็มของเกณฑ์",
			},
		)
		return
	}

	option := entity.JobCriteriaOption{
		JobCriteriaID: uint(criteriaID),
		Name:          req.Name,
		Description:   req.Description,
		Score:         req.Score,
		IsActive:      req.IsActive,
	}

	if err := c.db.Create(
		&option,
	).Error; err != nil {

		ctx.JSON(
			http.StatusInternalServerError,
			gin.H{
				"error": "ไม่สามารถเพิ่มตัวเลือกคะแนนได้",
			},
		)
		return
	}

	ctx.JSON(
		http.StatusCreated,
		gin.H{
			"message": "เพิ่มตัวเลือกคะแนนสำเร็จ",
			"data":    option,
		},
	)
}

// =====================================================
// PUT /api/job-criteria-options/:optionId
// แก้ไขตัวเลือกคะแนน
// =====================================================

func (c *JobCriteriaOptionController) Update(
	ctx *gin.Context,
) {
	optionID, err := strconv.ParseUint(
		ctx.Param("optionId"),
		10,
		32,
	)

	if err != nil {
		ctx.JSON(
			http.StatusBadRequest,
			gin.H{
				"error": "ID ตัวเลือกไม่ถูกต้อง",
			},
		)
		return
	}

	var option entity.JobCriteriaOption

	if err := c.db.First(
		&option,
		uint(optionID),
	).Error; err != nil {

		ctx.JSON(
			http.StatusNotFound,
			gin.H{
				"error": "ไม่พบตัวเลือกคะแนน",
			},
		)
		return
	}

	var criteria entity.JobCriteria

	if err := c.db.First(
		&criteria,
		option.JobCriteriaID,
	).Error; err != nil {

		ctx.JSON(
			http.StatusNotFound,
			gin.H{
				"error": "ไม่พบเกณฑ์ของตัวเลือกนี้",
			},
		)
		return
	}

	var req struct {
		Name        string  `json:"name"`
		Description string  `json:"description"`
		Score       float64 `json:"score"`
		IsActive    bool    `json:"is_active"`
	}

	if err := ctx.ShouldBindJSON(
		&req,
	); err != nil {

		ctx.JSON(
			http.StatusBadRequest,
			gin.H{
				"error": "รูปแบบข้อมูลไม่ถูกต้อง",
			},
		)
		return
	}

	req.Name = strings.TrimSpace(
		req.Name,
	)

	if req.Name == "" {
		ctx.JSON(
			http.StatusBadRequest,
			gin.H{
				"error": "กรุณาระบุชื่อตัวเลือก",
			},
		)
		return
	}

	if req.Score < 0 {
		ctx.JSON(
			http.StatusBadRequest,
			gin.H{
				"error": "คะแนนต้องไม่ติดลบ",
			},
		)
		return
	}

	if criteria.MaxScore > 0 &&
		req.Score > criteria.MaxScore {

		ctx.JSON(
			http.StatusBadRequest,
			gin.H{
				"error": "คะแนนตัวเลือกต้องไม่เกินคะแนนเต็มของเกณฑ์",
			},
		)
		return
	}

	option.Name = req.Name
	option.Description = req.Description
	option.Score = req.Score
	option.IsActive = req.IsActive

	if err := c.db.Save(
		&option,
	).Error; err != nil {

		ctx.JSON(
			http.StatusInternalServerError,
			gin.H{
				"error": "ไม่สามารถแก้ไขตัวเลือกคะแนนได้",
			},
		)
		return
	}

	ctx.JSON(
		http.StatusOK,
		gin.H{
			"message": "แก้ไขตัวเลือกคะแนนสำเร็จ",
			"data":    option,
		},
	)
}

// =====================================================
// DELETE /api/job-criteria-options/:optionId
// ลบตัวเลือกคะแนน
// =====================================================

func (c *JobCriteriaOptionController) Delete(
	ctx *gin.Context,
) {
	optionID, err := strconv.ParseUint(
		ctx.Param("optionId"),
		10,
		32,
	)

	if err != nil {
		ctx.JSON(
			http.StatusBadRequest,
			gin.H{
				"error": "ID ตัวเลือกไม่ถูกต้อง",
			},
		)
		return
	}

	var option entity.JobCriteriaOption

	if err := c.db.First(
		&option,
		uint(optionID),
	).Error; err != nil {

		ctx.JSON(
			http.StatusNotFound,
			gin.H{
				"error": "ไม่พบตัวเลือกคะแนน",
			},
		)
		return
	}

	if err := c.db.Delete(
		&option,
	).Error; err != nil {

		ctx.JSON(
			http.StatusInternalServerError,
			gin.H{
				"error": "ไม่สามารถลบตัวเลือกคะแนนได้",
			},
		)
		return
	}

	ctx.JSON(
		http.StatusOK,
		gin.H{
			"message": "ลบตัวเลือกคะแนนสำเร็จ",
		},
	)
}
