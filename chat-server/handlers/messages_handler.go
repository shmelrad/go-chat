package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

const MESSAGE_HISTORY_PAGE_SIZE = 100

func (a *App) GetMessageHistory(c *gin.Context) {
	chatIdStr := c.Query("chat_id")
	if chatIdStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid chat id"})
		return
	}
	chatID, err := strconv.ParseUint(chatIdStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid chat id"})
		return
	}

	offsetStr := c.Query("offset")
	if offsetStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "offset parameter is required"})
		return
	}
	offset, err := strconv.ParseInt(offsetStr, 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid offset parameter"})
		return
	}

	messages, appErr := a.messageService.GetMessageHistory(uint(chatID), MESSAGE_HISTORY_PAGE_SIZE, int(offset))
	if appErr != nil {
		c.JSON(appErr.Code, gin.H{"error": appErr.Message})
		return
	}

	c.JSON(http.StatusOK, gin.H{"messages": messages})
}
