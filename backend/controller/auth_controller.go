package controller

import (
    "net/http"

    "AI-Based-Recruitment-Screening-and-Employee-Advisory-System/backend/dto"
    "AI-Based-Recruitment-Screening-and-Employee-Advisory-System/backend/services"
    "github.com/gin-gonic/gin"
)

type AuthController struct {
    authService *services.AuthService
}

func NewAuthController(authService *services.AuthService) *AuthController {
    return &AuthController{authService: authService}
}

func (c *AuthController) RegisterHR(ctx *gin.Context) {
    var req dto.RegisterHRRequest
    if err := ctx.ShouldBindJSON(&req); err != nil {
        ctx.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง"})
        return
    }

    if err := c.authService.RegisterHR(req); err != nil {
        ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
        return
    }

    ctx.JSON(http.StatusOK, gin.H{"message": "ลงทะเบียนสำเร็จ"})
}

func (c *AuthController) Login(ctx *gin.Context) {
    var req dto.LoginRequest
    if err := ctx.ShouldBindJSON(&req); err != nil {
        ctx.JSON(http.StatusBadRequest, gin.H{"error": "ข้อมูลไม่ถูกต้อง"})
        return
    }

    res, err := c.authService.Login(req)
    if err != nil {
        ctx.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
        return
    }

    ctx.JSON(http.StatusOK, gin.H{
        "message":    "เข้าสู่ระบบสำเร็จ",
        "token":      res.Token,
        "role":       res.Role,
        "id":         res.ID,
        "first_name": res.FirstName,
        "last_name":  res.LastName,
        "email":      res.Email,
    })
}