package controller

import (
	"net/http"
	"strconv"

	"AI-Based-Recruitment-Screening-and-Employee-Advisory-System/backend/entity"
	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type KnowledgeController struct {
	db *gorm.DB
}

func NewKnowledgeController(db *gorm.DB) *KnowledgeController {
	return &KnowledgeController{db: db}
}

// GET /api/knowledge
func (c *KnowledgeController) GetAll(ctx *gin.Context) {
	var docs []entity.KnowledgeBase
	if err := c.db.Order("updated_at desc").Find(&docs).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลเอกสารได้"})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"data": docs})
}

// GET /api/knowledge/:id
func (c *KnowledgeController) GetByID(ctx *gin.Context) {
	id := ctx.Param("id")
	var doc entity.KnowledgeBase
	if err := c.db.First(&doc, id).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบเอกสาร"})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"data": doc})
}

type KnowledgeRequest struct {
	Filename string `json:"filename" binding:"required"`
	Content  string `json:"content" binding:"required"`
}

// POST /api/knowledge
func (c *KnowledgeController) Create(ctx *gin.Context) {
	var req KnowledgeRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง"})
		return
	}

	doc := entity.KnowledgeBase{
		Filename: req.Filename,
		Content:  req.Content,
	}

	if err := c.db.Create(&doc).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "สร้างเอกสารไม่สำเร็จ"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "บันทึกเอกสารสำเร็จ", "data": doc})
}

// PUT /api/knowledge/:id
func (c *KnowledgeController) Update(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID ไม่ถูกต้อง"})
		return
	}

	var req KnowledgeRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง"})
		return
	}

	var doc entity.KnowledgeBase
	if err := c.db.First(&doc, id).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบเอกสาร"})
		return
	}

	doc.Filename = req.Filename
	doc.Content = req.Content

	if err := c.db.Save(&doc).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "อัปเดตเอกสารไม่สำเร็จ"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "อัปเดตเอกสารสำเร็จ", "data": doc})
}

// DELETE /api/knowledge/:id
func (c *KnowledgeController) Delete(ctx *gin.Context) {
	id := ctx.Param("id")
	if err := c.db.Delete(&entity.KnowledgeBase{}, id).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "ลบเอกสารไม่สำเร็จ"})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"message": "ลบเอกสารสำเร็จ"})
}
