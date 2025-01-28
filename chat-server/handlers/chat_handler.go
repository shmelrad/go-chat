package handlers

import (
	"chat-server/models"
	"fmt"
	"net/http"
	"path/filepath"
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

func (a *App) CreateGroupChat(c *gin.Context) {
	user := c.MustGet("user").(*models.User)

	var body struct {
		Name string `json:"name" binding:"required"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	chat, appErr := a.chatService.CreateGroupChat(user.ID, body.Name)
	if appErr != nil {
		c.JSON(appErr.Code, gin.H{"error": appErr.Message})
		return
	}

	c.JSON(http.StatusOK, gin.H{"chat": chat})
}

func (a *App) UploadChatAvatar(c *gin.Context) {
	chatID := c.Param("chat_id")
	chatIDUint, err := strconv.ParseUint(chatID, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid chat id"})
		return
	}

	user := c.MustGet("user").(*models.User)
	if !a.chatService.IsAdmin(uint(chatIDUint), user.ID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not an admin of this chat"})
		return
	}

	file, err := c.FormFile("avatar")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded: " + err.Error()})
		return
	}

	if file.Size > 5*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File size must be less than 5MB"})
		return
	}

	filename, err := generateRandomString(64)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate random string"})
		return
	}
	filename = fmt.Sprintf("%s%s", filename, filepath.Ext(file.Filename))

	uploadPath := filepath.Join("assets", "images", filename)
	if err := c.SaveUploadedFile(file, uploadPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	avatarURL := fmt.Sprintf("/assets/images/%s", filename)
	if err := a.chatService.UpdateAvatar(uint(chatIDUint), avatarURL); err != nil {
		c.JSON(err.Code, gin.H{"error": err.Message})
		return
	}

	c.JSON(http.StatusOK, gin.H{"avatar_url": avatarURL})
}

func (a *App) AddParticipant(c *gin.Context) {
	chatID := c.Param("chat_id")
	chatIDUint, err := strconv.ParseUint(chatID, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid chat id"})
		return
	}

	user := c.MustGet("user").(*models.User)
	if !a.chatService.IsAdmin(uint(chatIDUint), user.ID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not an admin of this chat"})
		return
	}

	var body struct {
		Username string `json:"username" binding:"required"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request body"})
		return
	}

	member, appErr := a.chatService.AddParticipant(uint(chatIDUint), body.Username)
	if appErr != nil {
		c.JSON(appErr.Code, gin.H{"error": appErr.Message})
		return
	}

	c.JSON(http.StatusOK, gin.H{"member": member})
}

func (a *App) RemoveParticipant(c *gin.Context) {
	chatID := c.Param("chat_id")
	userID := c.Param("user_id")

	chatIDUint, err := strconv.ParseUint(chatID, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid chat id"})
		return
	}

	user := c.MustGet("user").(*models.User)
	if !a.chatService.IsAdmin(uint(chatIDUint), user.ID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "You are not an admin of this chat"})
		return
	}

	userIDUint, err := strconv.ParseUint(userID, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id"})
		return
	}

	if appErr := a.chatService.RemoveParticipant(uint(chatIDUint), uint(userIDUint)); appErr != nil {
		c.JSON(appErr.Code, gin.H{"error": appErr.Message})
		return
	}

	c.Status(http.StatusNoContent)
}
