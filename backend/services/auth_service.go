package services

import (
    "errors"

    "AI-Based-Recruitment-Screening-and-Employee-Advisory-System/backend/config"
    "AI-Based-Recruitment-Screening-and-Employee-Advisory-System/backend/dto"
    "AI-Based-Recruitment-Screening-and-Employee-Advisory-System/backend/entity"
    "gorm.io/gorm"
)

type AuthService struct {
    db *gorm.DB
}

func NewAuthService(db *gorm.DB) *AuthService {
    return &AuthService{db: db}
}

func (s *AuthService) RegisterHR(req dto.RegisterHRRequest) error {
    var count int64
    s.db.Model(&entity.HRManager{}).Where("email = ?", req.Email).Count(&count)
    if count > 0 {
        return errors.New("อีเมลนี้ถูกใช้งานแล้ว")
    }

    hashed, err := config.HashPassword(req.Password)
    if err != nil {
        return errors.New("สร้างรหัสผ่านไม่สำเร็จ")
    }

    hr := entity.HRManager{
        FirstName: req.FirstName,
        LastName:  req.LastName,
        Email:     req.Email,
        Password:  hashed,
    }

    if err := s.db.Create(&hr).Error; err != nil {
        return errors.New("ลงทะเบียนไม่สำเร็จ")
    }
    return nil
}

func (s *AuthService) Login(req dto.LoginRequest) (dto.LoginResponse, error) {
    var hr entity.HRManager
    errMsg := "อีเมลหรือรหัสผ่านไม่ถูกต้อง"

    if err := s.db.Where("email = ?", req.Email).First(&hr).Error; err != nil {
        return dto.LoginResponse{}, errors.New(errMsg)
    }

    if !config.CheckPasswordHash(req.Password, hr.Password) {
        return dto.LoginResponse{}, errors.New(errMsg)
    }

    token, err := config.GenerateJWT(hr.HrID, hr.Email, "hr")
    if err != nil {
        return dto.LoginResponse{}, errors.New("สร้าง token ไม่สำเร็จ")
    }

    return dto.LoginResponse{
        ID:        hr.HrID,
        FirstName: hr.FirstName,
        LastName:  hr.LastName,
        Email:     hr.Email,
        Role:      "hr",
        Token:     token,
    }, nil
}