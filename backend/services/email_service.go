package services

import (
	"fmt"
	"net/smtp"
	"strings"

	"AI-Based-Recruitment-Screening-and-Employee-Advisory-System/backend/config"
)

// SendApplicationEmail ส่งอีเมลแจ้งเตือนรหัสใบสมัครไปยัง Gmail ของผู้สมัครจริง
func SendApplicationEmail(toEmail string, candidateName string, jobTitle string, appCode string) error {
	fromEmail := config.Env.SMTPEmail
	if fromEmail == "" {
		fromEmail = "guymini02479@gmail.com"
	}

	appPassword := config.Env.SMTPPassword
	if appPassword == "" {
		appPassword = "gjsrvsyeqsixfvlk"
	}
	// ตัดช่องว่างของ App Password ออก
	appPassword = strings.ReplaceAll(appPassword, " ", "")

	smtpHost := "smtp.gmail.com"
	smtpPort := "587"

	subject := fmt.Sprintf("Subject: [HireAI] ยืนยันการสมัครงาน - ตำแหน่ง %s\r\n", jobTitle)
	headers := "MIME-version: 1.0;\nContent-Type: text/html; charset=\"UTF-8\";\r\n"
	fromHeader := fmt.Sprintf("From: HireAI Recruitment <%s>\r\n", fromEmail)
	toHeader := fmt.Sprintf("To: %s\r\n\r\n", toEmail)

	body := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; margin: 0; padding: 20px; }
        .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #e2e8f0; }
        .header { background: linear-gradient(135deg, #4169E1, #3152c4); color: #ffffff; padding: 32px 24px; text-align: center; }
        .header h1 { margin: 0; font-size: 22px; font-weight: 800; }
        .header p { margin: 6px 0 0 0; font-size: 13px; opacity: 0.9; }
        .content { padding: 32px 28px; color: #334155; }
        .code-box { background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 16px; padding: 20px; text-align: center; margin: 24px 0; }
        .code-title { font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; }
        .code-value { font-size: 28px; font-weight: 900; color: #4169E1; letter-spacing: 3px; font-family: monospace; margin: 8px 0; }
        .footer { background: #f8fafc; padding: 16px; text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
    </style>
</head>
<body>
    <div class="card">
        <div class="header">
            <h1>HireAI Recruitment</h1>
            <p>ระบบคัดกรองและประเมินผู้สมัครงานอัจฉริยะ</p>
        </div>
        <div class="content">
            <p style="font-size: 15px; margin-top: 0;">สวัสดีคุณ <b>%s</b>,</p>
            <p style="font-size: 14px; line-height: 1.6; color: #475569;">
                ระบบได้รับข้อมูลใบสมัครของคุณสำหรับตำแหน่ง <b>"%s"</b> เรียบร้อยแล้ว ขณะนี้ใบสมัครอยู่ในขั้นตอนการพิจารณาและคัดกรองเบื้องต้น
            </p>
            
            <div class="code-box">
                <div class="code-title">รหัสประจำตัวใบสมัครของคุณ (Application ID)</div>
                <div class="code-value">%s</div>
                <p style="font-size: 12px; color: #64748b; margin: 0;">โปรดบันทึกรหัสนี้ไว้เพื่อใช้ตรวจสอบสถานะการสมัครงาน</p>
            </div>

            <div style="background-color: #eff6ff; border-radius: 12px; padding: 14px; margin-top: 20px; font-size: 12px; color: #1e40af; line-height: 1.5;">
                💡 <b>คำแนะนำ:</b> คุณสามารถนำรหัส <b>%s</b> ไปกรอกในเมนู <b>"เช็คสถานะสมัครงาน"</b> บนหน้าแรกของเว็บไซต์ เพื่อติดตามความคืบหน้าได้ตลอด 24 ชม.
            </div>
        </div>
        <div class="footer">
            อีเมลนี้เป็นข้อความอัตโนมัติจากระบบ กรุณาอย่าตอบกลับอีเมลนี้
        </div>
    </div>
</body>
</html>
`, candidateName, jobTitle, appCode, appCode)

	msg := []byte(subject + headers + fromHeader + toHeader + body)

	auth := smtp.PlainAuth("", fromEmail, appPassword, smtpHost)

	err := smtp.SendMail(smtpHost+":"+smtpPort, auth, fromEmail, []string{toEmail}, msg)
	if err != nil {
		fmt.Printf("❌ [SMTP Error] ส่งอีเมลไปยัง %s ล้มเหลว: %v\n", toEmail, err)
		return err
	}

	fmt.Printf("📧 [SMTP Success] ส่งอีเมลรหัสใบสมัคร %s ไปยัง %s สำเร็จเรียบร้อย!\n", appCode, toEmail)
	return nil
}
