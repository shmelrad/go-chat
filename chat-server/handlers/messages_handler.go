package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func (a *App) GetMessages(c *gin.Context) {
	messages, err := a.messageService.GetMessages()
	if err != nil {
		c.JSON(err.Code, gin.H{"error": err.Message})
		return
	}

	c.JSON(http.StatusOK, gin.H{"messages": messages})
}
