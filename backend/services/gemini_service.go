package services

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"google.golang.org/genai"
)

type GeminiService struct {
	client *genai.Client
	model  string
}

type SuggestedCriteria struct {
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Weight      float64 `json:"weight"`
}

type JobAnalysisResult struct {
	Title             string              `json:"title"`
	Department        string              `json:"department"`
	Location          string              `json:"location"`
	EmploymentType    string              `json:"employment_type"`
	Salary            string              `json:"salary"`
	Description       []string            `json:"description"`
	Responsibilities  []string            `json:"responsibilities"`
	Requirements      []string            `json:"requirements"`
	TechnicalSkills   []string            `json:"technical_skills"`
	SoftSkills        []string            `json:"soft_skills"`
	Education         string              `json:"education"`
	Experience        string              `json:"experience"`
	SuggestedCriteria []SuggestedCriteria `json:"suggested_criteria"`
}

// สร้าง Gemini Service
func NewGeminiService() (*GeminiService, error) {
	apiKey := os.Getenv("GEMINI_API_KEY")

	if apiKey == "" {
		return nil, fmt.Errorf("ไม่พบ GEMINI_API_KEY")
	}

	model := os.Getenv("GEMINI_MODEL")

	if model == "" {
		model = "gemini-2.5-flash"
	}

	client, err := genai.NewClient(
		context.Background(),
		&genai.ClientConfig{
			APIKey: apiKey,
		},
	)

	if err != nil {
		return nil, fmt.Errorf(
			"สร้าง Gemini Client ไม่สำเร็จ: %w",
			err,
		)
	}

	return &GeminiService{
		client: client,
		model:  model,
	}, nil
}

// วิเคราะห์รูปภาพประกาศงานด้วย Gemini
func (s *GeminiService) AnalyzeImage(
	imageData []byte,
	mimeType string,
) (*JobAnalysisResult, error) {

	// ป้องกัน nil pointer
	if s == nil {
		return nil, fmt.Errorf(
			"Gemini Service ยังไม่ได้ถูกสร้าง กรุณาตรวจสอบ GEMINI_API_KEY และการสร้าง GeminiService",
		)
	}

	if s.client == nil {
		return nil, fmt.Errorf(
			"Gemini Client ยังไม่ได้ถูกสร้าง กรุณาตรวจสอบ GEMINI_API_KEY",
		)
	}

	if len(imageData) == 0 {
		return nil, fmt.Errorf(
			"ไม่พบข้อมูลรูปภาพสำหรับส่งให้ Gemini วิเคราะห์",
		)
	}

	if strings.TrimSpace(mimeType) == "" {
		return nil, fmt.Errorf(
			"ไม่พบ MIME Type ของรูปภาพ",
		)
	}

	// โค้ดเดิมด้านล่างทำงานต่อได้
	prompt := `
คุณเป็นผู้เชี่ยวชาญด้าน HR และการวิเคราะห์ประกาศรับสมัครงาน

วิเคราะห์รูปภาพประกาศรับสมัครงานที่ได้รับ และดึงข้อมูลต่อไปนี้:

- title: ชื่อตำแหน่งงาน
- department: แผนก
- location: สถานที่ทำงาน
- employment_type: ประเภทการจ้างงาน
- salary: เงินเดือน
- description: รายละเอียดงาน
- responsibilities: หน้าที่ความรับผิดชอบ
- requirements: คุณสมบัติผู้สมัคร
- technical_skills: ทักษะทางเทคนิค
- soft_skills: ทักษะด้านการทำงาน
- education: วุฒิการศึกษา
- experience: ประสบการณ์ทำงาน

สร้าง suggested_criteria สำหรับใช้ประเมินผู้สมัคร

แต่ละเกณฑ์ต้องมี:

- name
- description
- weight

น้ำหนักรวมของทุกเกณฑ์ต้องเท่ากับ 100

หากข้อมูลบางส่วนไม่มีในประกาศ ให้ใช้ค่าว่าง

รูปแบบชนิดข้อมูลต้องเป็นดังนี้:

- title: string
- department: string
- location: string
- employment_type: string
- salary: string
- description: array of strings
- responsibilities: array of strings
- requirements: array of strings
- technical_skills: array of strings
- soft_skills: array of strings
- education: string
- experience: string
- suggested_criteria: array

หากไม่มีข้อมูล:
- ข้อมูลแบบ string ให้ใช้ ""
- ข้อมูลแบบ array ให้ใช้ []

ตอบเป็น JSON เท่านั้น
ห้ามมีข้อความอื่นนอกเหนือจาก JSON
ห้ามครอบ JSON ด้วย Markdown
`

	contents := []*genai.Content{
		{
			Role: "user",
			Parts: []*genai.Part{
				{
					Text: prompt,
				},
				{
					InlineData: &genai.Blob{
						MIMEType: mimeType,
						Data:     imageData,
					},
				},
			},
		},
	}

	response, err := s.client.Models.GenerateContent(
		context.Background(),
		s.model,
		contents,
		&genai.GenerateContentConfig{
			ResponseMIMEType: "application/json",
		},
	)

	if err != nil {
		return nil, fmt.Errorf(
			"Gemini วิเคราะห์รูปภาพไม่สำเร็จ: %w",
			err,
		)
	}

	responseText := strings.TrimSpace(response.Text())

	if responseText == "" {
		return nil, fmt.Errorf(
			"Gemini ไม่ส่งผลลัพธ์กลับมา",
		)
	}

	// เผื่อ Gemini ส่ง Markdown กลับมา
	responseText = strings.TrimPrefix(responseText, "```json")
	responseText = strings.TrimPrefix(responseText, "```JSON")
	responseText = strings.TrimPrefix(responseText, "```")
	responseText = strings.TrimSuffix(responseText, "```")
	responseText = strings.TrimSpace(responseText)

	var result JobAnalysisResult

	if err := json.Unmarshal(
		[]byte(responseText),
		&result,
	); err != nil {
		return nil, fmt.Errorf(
			"แปลงผล Gemini เป็น JSON ไม่สำเร็จ: %w\nผลลัพธ์: %s",
			err,
			responseText,
		)
	}

	return &result, nil
}
