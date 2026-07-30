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

// =====================================================
// GET /api/job-positions/:id/criteria
// ดึงเกณฑ์การประเมินทั้งหมดของตำแหน่งงาน
// =====================================================

func (c *JobCriteriaController) GetByJobPositionID(
	ctx *gin.Context,
) {
	jobID, err := strconv.ParseUint(
		ctx.Param("id"),
		10,
		32,
	)

	if err != nil {
		ctx.JSON(
			http.StatusBadRequest,
			gin.H{
				"error": "ID ตำแหน่งงานไม่ถูกต้อง",
			},
		)
		return
	}

	// ตรวจสอบว่าตำแหน่งงานมีอยู่จริงหรือไม่
	var job entity.JobPosition

	if err := c.db.First(
		&job,
		uint(jobID),
	).Error; err != nil {

		ctx.JSON(
			http.StatusNotFound,
			gin.H{
				"error": "ไม่พบตำแหน่งงาน",
			},
		)
		return
	}

	// ดึงเกณฑ์ทั้งหมด
	var criteria []entity.JobCriteria

	if err := c.db.
		Where(
			"job_position_id = ?",
			uint(jobID),
		).
		Order(
			"created_at ASC",
		).
		Find(
			&criteria,
		).Error; err != nil {

		ctx.JSON(
			http.StatusInternalServerError,
			gin.H{
				"error": "ไม่สามารถดึงเกณฑ์การประเมินได้",
			},
		)
		return
	}

	ctx.JSON(
		http.StatusOK,
		gin.H{
			"data": criteria,
		},
	)
}

// =====================================================
// POST /api/job-positions/:id/criteria
// เพิ่มเกณฑ์การประเมิน
// =====================================================

func (c *JobCriteriaController) Create(
	ctx *gin.Context,
) {
	jobID, err := strconv.ParseUint(
		ctx.Param("id"),
		10,
		32,
	)

	if err != nil {
		ctx.JSON(
			http.StatusBadRequest,
			gin.H{
				"error": "ID ตำแหน่งงานไม่ถูกต้อง",
			},
		)
		return
	}

	// ตรวจสอบตำแหน่งงาน
	var job entity.JobPosition

	if err := c.db.First(
		&job,
		uint(jobID),
	).Error; err != nil {

		ctx.JSON(
			http.StatusNotFound,
			gin.H{
				"error": "ไม่พบตำแหน่งงาน",
			},
		)
		return
	}

	// รับข้อมูลจาก Frontend
	var req struct {
		Name        string  `json:"name"`
		Description string  `json:"description"`
		Weight      float64 `json:"weight"`
		IsRequired  bool    `json:"is_required"`
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

	// ตรวจสอบชื่อเกณฑ์
	if req.Name == "" {
		ctx.JSON(
			http.StatusBadRequest,
			gin.H{
				"error": "กรุณาระบุชื่อเกณฑ์",
			},
		)
		return
	}

	// ตรวจสอบน้ำหนัก
	if req.Weight < 0 ||
		req.Weight > 100 {

		ctx.JSON(
			http.StatusBadRequest,
			gin.H{
				"error": "น้ำหนักคะแนนต้องอยู่ระหว่าง 0 ถึง 100",
			},
		)
		return
	}

	criteria := entity.JobCriteria{
		JobPositionID: uint(jobID),
		Name:          req.Name,
		Description:   req.Description,
		Weight:        req.Weight,
		IsRequired:    req.IsRequired,
	}

	if err := c.db.Create(
		&criteria,
	).Error; err != nil {

		ctx.JSON(
			http.StatusInternalServerError,
			gin.H{
				"error": "ไม่สามารถเพิ่มเกณฑ์การประเมินได้",
			},
		)
		return
	}

	ctx.JSON(
		http.StatusCreated,
		gin.H{
			"message": "เพิ่มเกณฑ์การประเมินสำเร็จ",
			"data":    criteria,
		},
	)
}

// =====================================================
// PUT /api/job-criteria/:criteriaId
// แก้ไขเกณฑ์การประเมิน
// =====================================================

func (c *JobCriteriaController) Update(
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
		Weight      float64 `json:"weight"`
		IsRequired  bool    `json:"is_required"`
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

	if req.Name == "" {
		ctx.JSON(
			http.StatusBadRequest,
			gin.H{
				"error": "กรุณาระบุชื่อเกณฑ์",
			},
		)
		return
	}

	if req.Weight < 0 ||
		req.Weight > 100 {

		ctx.JSON(
			http.StatusBadRequest,
			gin.H{
				"error": "น้ำหนักคะแนนต้องอยู่ระหว่าง 0 ถึง 100",
			},
		)
		return
	}

	criteria.Name = req.Name
	criteria.Description = req.Description
	criteria.Weight = req.Weight
	criteria.IsRequired = req.IsRequired

	if err := c.db.Save(
		&criteria,
	).Error; err != nil {

		ctx.JSON(
			http.StatusInternalServerError,
			gin.H{
				"error": "ไม่สามารถแก้ไขเกณฑ์การประเมินได้",
			},
		)
		return
	}

	ctx.JSON(
		http.StatusOK,
		gin.H{
			"message": "แก้ไขเกณฑ์การประเมินสำเร็จ",
			"data":    criteria,
		},
	)
}

// =====================================================
// DELETE /api/job-criteria/:criteriaId
// ลบเกณฑ์การประเมิน
// =====================================================

func (c *JobCriteriaController) Delete(
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

	if err := c.db.Delete(
		&criteria,
	).Error; err != nil {

		ctx.JSON(
			http.StatusInternalServerError,
			gin.H{
				"error": "ไม่สามารถลบเกณฑ์การประเมินได้",
			},
		)
		return
	}

	ctx.JSON(
		http.StatusOK,
		gin.H{
			"message": "ลบเกณฑ์การประเมินสำเร็จ",
		},
	)
}
