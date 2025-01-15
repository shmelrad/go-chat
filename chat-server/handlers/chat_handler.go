package handlers

import (
	"chat-server/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func (a *App) GetDmWithUser(c *gin.Context) {
	user := c.MustGet("user").(*models.User)
	recipientID := c.Param("recipient_id")
	recipientIDUint, err := strconv.ParseUint(recipientID, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid recipient id"})
		return
	}
	chat, appErr := a.chatService.GetDmByIds(user.ID, uint(recipientIDUint))
	if appErr != nil {
		c.JSON(appErr.Code, gin.H{"error": appErr.Message})
		return
	}
	c.JSON(http.StatusOK, gin.H{"chat": chat})
}

func (a *App) CreateDmWithUser(c *gin.Context) {
	user := c.MustGet("user").(*models.User)

	var body struct {
		RecipientID uint `json:"recipientId" binding:"required"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	chat, appErr := a.chatService.CreateDmByUsers(user.ID, body.RecipientID)
	if appErr != nil {
		c.JSON(appErr.Code, gin.H{"error": appErr.Message})
		return
	}

	c.JSON(http.StatusOK, gin.H{"chat": chat})
}

func (a *App) GetChatById(c *gin.Context) {
	chatID := c.Param("chat_id")
	chatIDUint, err := strconv.ParseUint(chatID, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid chat id"})
		return
	}
	chat, appErr := a.chatService.GetChatById(uint(chatIDUint))
	if appErr != nil {
		c.JSON(appErr.Code, gin.H{"error": appErr.Message})
		return
	}
	c.JSON(http.StatusOK, gin.H{"chat": chat})
}

