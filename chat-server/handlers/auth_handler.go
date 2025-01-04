package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

type LoginUserDto struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

type RegisterUserDto struct {
	LoginUserDto
	Email    string `json:"email"`
}

func (a *App) LoginUser(c *gin.Context) {
	var dto LoginUserDto
	if err := c.ShouldBindJSON(&dto); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	token, appErr := a.authService.LoginUser(dto.Username, dto.Password)
	if appErr != nil {
		c.JSON(appErr.Code, gin.H{"error": appErr.Message})
		return
	}

	c.JSON(http.StatusOK, gin.H{"token": token})
}

func (a *App) RegisterUser(c *gin.Context) {
	var dto RegisterUserDto
	if err := c.ShouldBindJSON(&dto); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	_, appErr := a.authService.RegisterUser(dto.Email, dto.Username, dto.Password)
	if appErr != nil {
		c.JSON(appErr.Code, gin.H{"error": appErr.Message})
		return
	}

	c.Status(http.StatusCreated)
}
