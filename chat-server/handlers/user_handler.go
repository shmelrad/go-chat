package handlers

import (
	"chat-server/models"
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net/http"
	"path/filepath"
	"strconv"

	"github.com/gin-gonic/gin"
)

const SEARCH_USERS_PAGE_SIZE = 20

func (a *App) SearchUsers(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Search query is required"})
		return
	}

	offsetStr := c.Query("offset")
	if offsetStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Offset parameter is required"})
		return
	}

	offset, err := strconv.Atoi(offsetStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid offset parameter"})
		return
	}

	users, appErr := a.userService.SearchUsers(query, SEARCH_USERS_PAGE_SIZE, offset)
	if appErr != nil {
		c.JSON(appErr.Code, gin.H{"error": appErr.Message})
		return
	}

	c.JSON(http.StatusOK, gin.H{"users": users})
}

func (a *App) GetChats(c *gin.Context) {
	user := c.MustGet("user").(*models.User)
	chats, err := a.userService.GetChats(user.ID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get chats"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"chats": chats})
}

func (a *App) UploadAvatar(c *gin.Context) {
	user := c.MustGet("user").(*models.User)


	file, err := c.FormFile("avatar")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No file uploaded: " + err.Error()})
		return
	}
	if file.Size > 5*1024*1024 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "File size must be less than 5MB"})
		return
	}
	ext := filepath.Ext(file.Filename)
	filename, err := generateRandomString(64)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate random string"})
		return
	}
	filename = fmt.Sprintf("%s%s", filename, ext)

	uploadPath := filepath.Join("assets", "images", filename)
	if err := c.SaveUploadedFile(file, uploadPath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save file"})
		return
	}

	avatarURL := fmt.Sprintf("/assets/images/%s", filename)
	token, appErr := a.userService.UpdateAvatar(user.ID, avatarURL)
	if appErr != nil {
		c.JSON(appErr.Code, gin.H{"error": appErr.Message})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"avatar_url": avatarURL,
		"token":      token,
	})
}

func generateRandomString(length int) (string, error) {
	bytes := make([]byte, length/2)
	_, err := rand.Read(bytes)
	if err != nil {
		return "", err
	}
	return hex.EncodeToString(bytes), nil
}