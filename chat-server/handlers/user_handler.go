package handlers

import (
	"chat-server/models"
	"net/http"
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
