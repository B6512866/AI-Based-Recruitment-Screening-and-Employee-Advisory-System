package services

import (
	"context"
	"encoding/json"
	"fmt"
	"os"
	"strings"

	"google.golang.org/genai"
)

// 1. ประกาศ Struct GeminiService
type GeminiService struct {
	client *genai.Client
	model  string
}

// โครงสร้างระดับคะแนนของแต่ละ Rubric
type RubricLevel struct {
	Level     string `json:"level"`
	Condition string `json:"condition"`
	Score     int    `json:"score"`
}

// โครงสร้างเกณฑ์การประเมินย่อยแต่ละข้อ
type CriteriaRubric struct {
	ID              string        `json:"id"`
	Category        string        `json:"category"`
	Title           string        `json:"title"`
	Description     string        `json:"description"`
	SuggestedRubric []RubricLevel `json:"suggested_rubric"`
}

// โครงสร้างผลลัพธ์การวิเคราะห์ประกาศงาน
type JobAnalysisResult struct {
	Title             string           `json:"title"`
	Department        string           `json:"department"`
	Location          string           `json:"location"`
	EmploymentType    string           `json:"employment_type"`
	Salary            string           `json:"salary"`
	Description       []string         `json:"description"`
	Responsibilities  []string         `json:"responsibilities"`
	Requirements      []string         `json:"requirements"`
	TechnicalSkills   []string         `json:"technical_skills"`
	SoftSkills        []string         `json:"soft_skills"`
	Education         string           `json:"education"`
	Experience        string           `json:"experience"`
	SuggestedCriteria []CriteriaRubric `json:"suggested_criteria"`
}

// 2. เมธอดสร้าง GeminiService
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
		return nil, fmt.Errorf("สร้าง Gemini Client ไม่สำเร็จ: %w", err)
	}

	return &GeminiService{
		client: client,
		model:  model,
	}, nil
}

// 3. เมธอดวิเคราะห์รูปภาพ
func (s *GeminiService) AnalyzeImage(
	imageData []byte,
	mimeType string,
) (*JobAnalysisResult, error) {

	if s == nil || s.client == nil {
		return nil, fmt.Errorf("Gemini Client ยังไม่ได้ถูกสร้างอย่างถูกต้อง")
	}

	if len(imageData) == 0 {
		return nil, fmt.Errorf("ไม่พบข้อมูลรูปภาพสำหรับส่งให้ Gemini วิเคราะห์")
	}

	if strings.TrimSpace(mimeType) == "" {
		return nil, fmt.Errorf("ไม่พบ MIME Type ของรูปภาพ")
	}

	prompt := `
คุณเป็นผู้เชี่ยวชาญด้าน HR และการวิเคราะห์ประกาศรับสมัครงาน

จงวิเคราะห์รูปภาพประกาศรับสมัครงานที่ได้รับ และปฏิบัติภารกิจดังต่อไปนี้:

1. สกัดข้อมูลพื้นฐานของประกาศงานสำหรับสร้างตำแหน่งงานในระบบ
2. สกัดคุณสมบัติที่ต้องการออกมาเป็นข้อๆ และสร้าง "ร่างเกณฑ์ประเมินระดับคะแนน (Suggested Rubric)" เพื่อให้ HR นำไปปรับแต่งตัวเลขคะแนนและเงื่อนไขต่อเองได้ง่าย

รูปแบบโครงสร้างข้อมูลต้องเป็น JSON ตามรายละเอียดนี้เท่านั้น:

{
  "title": "ชื่อตำแหน่งงาน (string)",
  "department": "แผนก (string)",
  "location": "สถานที่ทำงาน (string)",
  "employment_type": "ประเภทการจ้างงาน เช่น Full-time, Part-time (string)",
  "salary": "เงินเดือน (string)",
  "description": ["รายละเอียดงาน (array of strings)"],
  "responsibilities": ["หน้าที่ความรับผิดชอบ (array of strings)"],
  "requirements": ["คุณสมบัติผู้สมัครโดยรวม (array of strings)"],
  "technical_skills": ["ทักษะทางเทคนิค (array of strings)"],
  "soft_skills": ["ทักษะด้านการทำงานร่วมกัน (array of strings)"],
  "education": "วุฒิการศึกษา (string)",
  "experience": "ประสบการณ์ทำงาน (string)",
  "suggested_criteria": [
    {
      "id": "req_1",
      "category": "หมวดหมู่ เช่น technical_skills, experience, education, soft_skills (string)",
      "title": "หัวข้อคุณสมบัติย่อย เช่น ความเชี่ยวชาญ Golang (string)",
      "description": "คำอธิบายรายละเอียดคุณสมบัตินี้ (string)",
      "suggested_rubric": [
        {
          "level": "ชื่อระดับ เช่น Excellent, Good, Fair, Poor หรือ Match, Partial Match, No Match (string)",
          "condition": "เงื่อนไขคุณสมบัติของผู้สมัครที่จะตกอยู่ในระดับนี้ (string)",
          "score": 10
        }
      ]
    }
  ]
}

เงื่อนไขเพิ่มเติม:
- หากข้อมูลส่วนใดไม่มีในรูปภาพ ให้ใส่ "" สำหรับ string และ [] สำหรับ array
- ไม่ต้องใส่ weight หรือเปรียบเทียบเป็น 100%
- ค่า score ใน suggested_rubric ให้ใส่เป็นตัวเลขคะแนนเริ่มต้นที่สมเหตุสมผล (เช่น 10, 7, 4, 0 หรือ 5, 3, 0) เพื่อให้ HR ไปแก้ไขต่อได้
- ตอบกลับเป็น Pure JSON เท่านั้น ห้ามมีข้อความอื่นเกริ่นนำ และห้ามครอบด้วย Markdown code block (` + "```json" + `)
`

	contents := []*genai.Content{
		{
			Role: "user",
			Parts: []*genai.Part{
				{Text: prompt},
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
		return nil, fmt.Errorf("Gemini วิเคราะห์รูปภาพไม่สำเร็จ: %w", err)
	}

	responseText := strings.TrimSpace(response.Text())
	if responseText == "" {
		return nil, fmt.Errorf("Gemini ไม่ส่งผลลัพธ์กลับมา")
	}

	responseText = strings.TrimPrefix(responseText, "```json")
	responseText = strings.TrimPrefix(responseText, "```JSON")
	responseText = strings.TrimPrefix(responseText, "```")
	responseText = strings.TrimSuffix(responseText, "```")
	responseText = strings.TrimSpace(responseText)

	var result JobAnalysisResult
	if err := json.Unmarshal([]byte(responseText), &result); err != nil {
		return nil, fmt.Errorf("แปลงผล Gemini เป็น JSON ไม่สำเร็จ: %w\nผลลัพธ์: %s", err, responseText)
	}

	return &result, nil
}
