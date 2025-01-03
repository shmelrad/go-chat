package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)


func (a *App) GetMessages(c *gin.Context) {
	messages, err := a.messageService.GetMessages()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to get messages"})
		return
	}

	c.JSON(http.StatusOK, messages)
}
