package handlers

import (
	"chat-server/handlers/ws"
	"chat-server/models"

	"github.com/gin-gonic/gin"
)

type App struct {
	messageService models.MessageService
}

func InitRoutes(r *gin.Engine, messageService models.MessageService) {
	app := &App{messageService: messageService}

	mg := r.Group("/api/messages")
	mg.GET("/", app.GetMessages)
	hub := ws.NewHub(messageService)
	go hub.Run()

	r.GET("/ws", func(c *gin.Context) {
		ws.ServeWs(hub, c.Writer, c.Request)
	})
}
