package controller

import (
	"net/http"
	"strconv"

	"AI-Based-Recruitment-Screening-and-Employee-Advisory-System/backend/entity"
	"AI-Based-Recruitment-Screening-and-Employee-Advisory-System/backend/services"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type JobPositionController struct {
	db *gorm.DB
}

func NewJobPositionController(db *gorm.DB) *JobPositionController {
	return &JobPositionController{db: db}
}

// GET /api/job-positions
func (c *JobPositionController) GetAll(ctx *gin.Context) {
	var jobs []entity.JobPosition
	if err := c.db.Order("updated_at desc").Find(&jobs).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลตำแหน่งงานได้"})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"data": jobs})
}

// GET /api/job-positions/:id
func (c *JobPositionController) GetByID(ctx *gin.Context) {
	id := ctx.Param("id")
	var job entity.JobPosition
	if err := c.db.First(&job, id).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบตำแหน่งงาน"})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"data": job})
}

// POST /api/job-positions
func (c *JobPositionController) Create(ctx *gin.Context) {
	var req entity.JobPosition
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง"})
		return
	}

	var userID uint = 1
	if idVal, exists := ctx.Get("id"); exists {
		if idFloat, ok := idVal.(float64); ok {
			userID = uint(idFloat)
		} else if idUint, ok := idVal.(uint); ok {
			userID = idUint
		}
	}

	status := req.Status
	if status == "" {
		status = "เปิดรับสมัคร"
	}

	job := entity.JobPosition{
		Title:       req.Title,
		Department:  req.Department,
		Location:    req.Location,
		Salary:      req.Salary,
		Type:        req.Type,
		Benefits:    req.Benefits,
		ContactInfo: req.ContactInfo,
		Description: req.Description,
		Criteria:    req.Criteria,
		Status:      status,
		UserID:      userID,
	}

	if err := c.db.Create(&job).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "สร้างตำแหน่งงานไม่สำเร็จ"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "บันทึกตำแหน่งงานสำเร็จ", "data": job})
}

// PUT /api/job-positions/:id
func (c *JobPositionController) Update(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID ไม่ถูกต้อง"})
		return
	}

	var req entity.JobPosition
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง"})
		return
	}

	var job entity.JobPosition
	if err := c.db.First(&job, id).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบตำแหน่งงาน"})
		return
	}

	job.Title = req.Title
	job.Department = req.Department
	job.Location = req.Location
	job.Salary = req.Salary
	job.Type = req.Type
	job.Benefits = req.Benefits
	job.ContactInfo = req.ContactInfo
	job.Description = req.Description
	job.Criteria = req.Criteria
	if req.Status != "" {
		job.Status = req.Status
	}

	if err := c.db.Save(&job).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "อัปเดตตำแหน่งงานไม่สำเร็จ"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "อัปเดตข้อมูลสำเร็จ", "data": job})
}

// DELETE /api/job-positions/:id
func (c *JobPositionController) Delete(ctx *gin.Context) {
	id := ctx.Param("id")
	var job entity.JobPosition
	if err := c.db.First(&job, id).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบตำแหน่งงาน"})
		return
	}

	if err := c.db.Delete(&job).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "ลบตำแหน่งงานไม่สำเร็จ"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "ลบตำแหน่งงานสำเร็จ"})
}

// POST /api/job-positions/:id/apply
func (c *JobPositionController) Apply(ctx *gin.Context) {
	idStr := ctx.Param("id")
	jobID, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID ตำแหน่งงานไม่ถูกต้อง"})
		return
	}

	var job entity.JobPosition
	if err := c.db.First(&job, jobID).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบตำแหน่งงานนี้ในระบบ"})
		return
	}

	var req struct {
		entity.Candidate
		ResumeURL      string `json:"resume_url"`
		TranscriptURL  string `json:"transcript_url"`
		TranscriptText string `json:"transcript_text"`
	}
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "กรุณากรอกข้อมูลและอัปโหลดเอกสารให้ครบถ้วน"})
		return
	}

	candidate := entity.Candidate{
		FirstName: req.FirstName,
		LastName:  req.LastName,
		Email:     req.Email,
		Phone:     req.Phone,
	}

	if err := c.db.Where(entity.Candidate{Email: req.Email}).
		FirstOrCreate(&candidate).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถบันทึกข้อมูลผู้สมัครได้"})
		return
	}

	app := entity.Application{
		Status:         "รอพิจารณา",
		Position:       job.Title,
		ResumeText:     req.ResumeText,
		ResumeURL:      req.ResumeURL,
		TranscriptURL:  req.TranscriptURL,
		TranscriptText: req.TranscriptText,
		CandidateID:    candidate.ID,
		JobPositionID:  job.ID,
	}

	if err := c.db.Create(&app).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "ส่งใบสมัครไม่สำเร็จ"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "ส่งใบสมัครสำเร็จ!"})

	// สร้างรหัสประจำตัวใบสมัคร
	applicationCode := "APP-" + strconv.FormatUint(uint64(app.ID+10000), 10)
	candidateFullName := candidate.FirstName + " " + candidate.LastName

	// 📧 ส่งอีเมลจริงไปยัง Gmail ของผู้สมัครผ่าน Background Goroutine
	go services.SendApplicationEmail(candidate.Email, candidateFullName, job.Title, applicationCode)

	ctx.JSON(http.StatusOK, gin.H{
		"message":          "ส่งใบสมัครสำเร็จ!",
		"application_id":   app.ID,
		"application_code": applicationCode,
	})
}

// GET /api/job-positions/:id/applications
func (c *JobPositionController) GetApplications(ctx *gin.Context) {
	id := ctx.Param("id")
	var apps []entity.Application

	err := c.db.Preload("Candidate").Preload("AIScreening").
		Where("job_position_id = ?", id).
		Order("created_at desc").
		Find(&apps).Error
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถดึงข้อมูลผู้สมัครได้"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"data": apps})
}

// PUT /api/applications/:appId/screening
func (c *JobPositionController) UpdateApplicationScreening(ctx *gin.Context) {
	idStr := ctx.Param("appId")
	appID, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID ใบสมัครไม่ถูกต้อง"})
		return
	}

	var req struct {
		Score      float64 `json:"score"`
		Strengths  string  `json:"strengths"`
		ModelUsed  string  `json:"model_used"`
		ResumeText string  `json:"resume_text"`
	}
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง"})
		return
	}

	var app entity.Application
	if err := c.db.First(&app, appID).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบใบสมัครนี้"})
		return
	}

	var responseData entity.AIScreening

	err = c.db.Transaction(func(tx *gorm.DB) error {
		if req.ResumeText != "" {
			app.ResumeText = req.ResumeText
		}

		if app.ScreeningID != nil {
			var scr entity.AIScreening
			if err := tx.First(&scr, *app.ScreeningID).Error; err == nil {
				scr.SkillScore = req.Score
				scr.Strengths = req.Strengths
				scr.ModelUsed = req.ModelUsed
				if err := tx.Save(&scr).Error; err != nil {
					return err
				}

				app.AIScore = req.Score
				if err := tx.Save(&app).Error; err != nil {
					return err
				}

				responseData = scr
				return nil
			}
		}

		scr := entity.AIScreening{
			SkillScore: req.Score,
			Strengths:  req.Strengths,
			ModelUsed:  req.ModelUsed,
		}
		if err := tx.Create(&scr).Error; err != nil {
			return err
		}

		app.ScreeningID = &scr.ID
		app.AIScore = req.Score
		if err := tx.Save(&app).Error; err != nil {
			return err
		}

		responseData = scr
		return nil
	})

	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "ไม่สามารถบันทึกผลการประเมิน AI ได้"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{
		"message": "วิเคราะห์ผู้สมัครและบันทึกคะแนน AI สำเร็จ",
		"data":    responseData,
	})
}

// DELETE /api/applications/:appId
func (c *JobPositionController) DeleteApplication(ctx *gin.Context) {
	idStr := ctx.Param("appId")
	appID, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "ID ใบสมัครไม่ถูกต้อง"})
		return
	}

	var app entity.Application
	if err := c.db.First(&app, appID).Error; err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบใบสมัครนี้"})
		return
	}

	if err := c.db.Delete(&app).Error; err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "ลบใบสมัครไม่สำเร็จ"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "ลบผู้สมัครเรียบร้อยแล้ว"})
}

// GET /api/applications/status/:appCode
func (c *JobPositionController) GetApplicationStatus(ctx *gin.Context) {
	appCode := ctx.Param("appCode")
	if len(appCode) < 5 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "รหัสใบสมัครสั้นเกินไป"})
		return
	}

	// ลบ prefix APP- (ถ้ามี)
	parsedStr := appCode
	if (len(appCode) >= 4) && (appCode[:4] == "APP-" || appCode[:4] == "app-") {
		parsedStr = appCode[4:]
	}

	val, err := strconv.ParseUint(parsedStr, 10, 32)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "รหัสใบสมัครไม่ถูกต้อง"})
		return
	}

	var appID uint = uint(val)
	if appID > 10000 {
		appID -= 10000
	}

	var app entity.Application
	// โหลดความสัมพันธ์ของ Candidate และ JobPosition
	err = c.db.Preload("Candidate").Preload("JobPosition").First(&app, appID).Error
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "ไม่พบข้อมูลใบสมัครงานสำหรับรหัสนี้"})
		return
	}

	// ปิดบังนามสกุลบางส่วนเพื่อความเป็นส่วนตัวในการค้นหาแบบสาธารณะ
	maskedLastName := ""
	if len(app.Candidate.LastName) > 0 {
		maskedLastName = string([]rune(app.Candidate.LastName)[0]) + "..."
	}

	ctx.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"id":             app.ID,
			"code":           "APP-" + strconv.FormatUint(uint64(app.ID+10000), 10),
			"first_name":     app.Candidate.FirstName,
			"last_name":      maskedLastName,
			"position_title": app.Position,
			"status":         app.Status,
			"created_at":     app.CreatedAt,
		},
	})
}
