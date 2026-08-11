package services

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"AI-Based-Recruitment-Screening-and-Employee-Advisory-System/backend/dto"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

type GeminiService struct {
	client *genai.Client
	model  *genai.GenerativeModel
}

func NewGeminiService(apiKey string) (*GeminiService, error) {
	if apiKey == "" {
		return nil, fmt.Errorf("GEMINI_API_KEY ไม่ถูกตั้งค่า")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()
	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return nil, fmt.Errorf("ไม่สามารถสร้าง Gemini Client ได้: %v", err)
	}

	// ใช้ gemini-2.5-flash สำหรับงานประมวลผลทั่วไปและ OCR Vision
	model := client.GenerativeModel("gemini-2.5-flash")

	// กำหนดให้ตอบกลับเป็น JSON เสมอ
	model.ResponseMIMEType = "application/json"

	return &GeminiService{
		client: client,
		model:  model,
	}, nil
}

// ExtractJobInfoFromImage: สกัดข้อมูลประกาศรับสมัครงานจากรูปภาพ
func (s *GeminiService) ExtractJobInfoFromImage(ctx context.Context, imageBytes []byte, mimeType string) (*dto.ExtractedJobResponse, error) {
	// 🛠️ 1. ตรวจจับ MIME Type จากเนื้อไฟล์จริง
	detectedMime := http.DetectContentType(imageBytes)

	// 🛠️ 2. ดึงเฉพาะชื่อ Format (เช่น png, jpeg) ห้ามมีคำว่า image/ เด็ดขาด!
	format := ""
	if strings.HasPrefix(detectedMime, "image/") {
		format = strings.TrimPrefix(detectedMime, "image/")
	} else {
		// Fallback ไปใช้ mimeType ที่รับมาจาก Controller
		format = strings.ToLower(strings.TrimSpace(mimeType))
		format = strings.TrimPrefix(format, "image/")
	}

	// 🛠️ 3. ปรับแก้ให้ตรงตามมาตรฐานที่ Gemini SDK ต้องการ
	if format == "jpg" || format == "pjpeg" {
		format = "jpeg"
	}
	if format == "" || format == "octet-stream" {
		format = "jpeg" // Default
	}

	fmt.Printf("🔍 Format sent to genai.ImageData (SDK auto-prepends 'image/'): %s\n", format)

	prompt := `คุณคือผู้เชี่ยวชาญด้าน HR และการวิเคราะห์ประกาศรับสมัครงาน 
โปรดอ่านและสกัดข้อมูลจากรูปภาพประกาศรับสมัครงานนี้ แล้วแปลงให้อยู่ในรูปแบบ JSON ตามโครงสร้างต่อไปนี้เท่านั้น:

{
  "title": "ชื่อตำแหน่งงาน",
  "department": "ชื่อแผนกหรือฝ่าย",
  "location": "สถานที่ทำงาน",
  "salary": "ช่วงเงินเดือน",
  "type": "ประเภทการจ้างงาน",
  "description": "คำอธิบายรายละเอียดงานโดยย่อ",
  "qualifications": ["คุณสมบัติข้อที่ 1"],
  "responsibilities": ["ความรับผิดชอบข้อที่ 1"],
  "benefits": ["สวัสดิการข้อที่ 1"],
  "suggested_criteria": [
    {
      "id": "c1",
      "title": "ชื่อเกณฑ์หลักประเมิน",
      "weight": 50,
      "sub_criteria": [
        {
          "id": "s1_1",
          "title": "ชื่อเกณฑ์ย่อย",
          "description": "คำอธิบายการประเมิน",
          "weight": 50
        }
      ]
    }
  ]
}`

	// ⚠️ ส่งแค่ตัวแปร format (เช่น "png") ห้ามมี "image/"
	resp, err := s.model.GenerateContent(ctx,
		genai.ImageData(format, imageBytes),
		genai.Text(prompt),
	)
	if err != nil {
		return nil, fmt.Errorf("gemini image analysis failed: %v", err)
	}

	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return nil, fmt.Errorf("gemini ไม่ได้ส่งผลลัพธ์กลับมา")
	}

	var responseText string
	for _, part := range resp.Candidates[0].Content.Parts {
		if text, ok := part.(genai.Text); ok {
			responseText += string(text)
		}
	}

	// 🛠️ ลบ Markdown Code Block ทิ้งเผื่อ Gemini ส่งกลับมาเป็น ```json ... ```
	responseText = strings.TrimSpace(responseText)
	if strings.HasPrefix(responseText, "```json") {
		responseText = strings.TrimPrefix(responseText, "```json")
		responseText = strings.TrimSuffix(responseText, "```")
	} else if strings.HasPrefix(responseText, "```") {
		responseText = strings.TrimPrefix(responseText, "```")
		responseText = strings.TrimSuffix(responseText, "```")
	}

	var extractedData dto.ExtractedJobResponse
	if err := json.Unmarshal([]byte(responseText), &extractedData); err != nil {
		fmt.Printf("❌ JSON Parse Error: \n%s\n", responseText)
		return nil, fmt.Errorf("ไม่สามารถแปลงข้อมูล JSON จาก Gemini ได้: %v", err)
	}

	return &extractedData, nil
}

// GenerateCriteriaFromText: เจนเกณฑ์ประเมินจาก Job Title และ Job Description
func (s *GeminiService) GenerateCriteriaFromText(ctx context.Context, jobTitle string, jobDescription string) ([]dto.MainCriterionDTO, error) {
	prompt := fmt.Sprintf(`คุณคือผู้เชี่ยวชาญด้าน HR Recruiter
โปรดสร้างเกณฑ์ประเมินผู้สมัครงาน สำหรับตำแหน่ง: "%s"
รายละเอียดงาน: "%s"

ตอบกลับมาในรูปแบบ JSON Array ของเกณฑ์ประเมินตามโครงสร้างนี้เท่านั้น:
[
  {
    "id": "c1",
    "title": "ชื่อเกณฑ์หลัก",
    "weight": 40,
    "sub_criteria": [
      {
        "id": "s1_1",
        "title": "ชื่อเกณฑ์ย่อย",
        "description": "รายละเอียดสิ่งที่ใช้ประเมิน",
        "weight": 50
      }
    ]
  }
]`, jobTitle, jobDescription)

	resp, err := s.model.GenerateContent(ctx, genai.Text(prompt))
	if err != nil {
		return nil, fmt.Errorf("gemini generate criteria failed: %v", err)
	}

	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return nil, fmt.Errorf("gemini ไม่ได้ส่งผลลัพธ์กลับมา")
	}

	var responseText string
	for _, part := range resp.Candidates[0].Content.Parts {
		if text, ok := part.(genai.Text); ok {
			responseText += string(text)
		}
	}

	responseText = strings.TrimSpace(responseText)
	if strings.HasPrefix(responseText, "```json") {
		responseText = strings.TrimPrefix(responseText, "```json")
		responseText = strings.TrimSuffix(responseText, "```")
	}

	var criteria []dto.MainCriterionDTO
	if err := json.Unmarshal([]byte(responseText), &criteria); err != nil {
		return nil, fmt.Errorf("ไม่สามารถแปลงข้อมูล JSON จาก Gemini ได้: %v", err)
	}

	return criteria, nil
}

func (s *GeminiService) Close() {
	if s.client != nil {
		s.client.Close()
	}
}
