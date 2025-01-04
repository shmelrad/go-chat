package handlers

import (
	"chat-server/handlers/middlewares"
	"chat-server/handlers/ws"
	"chat-server/models"

	"net/http"

	"github.com/gin-gonic/gin"
)

type App struct {
	messageService models.MessageService
	userService    models.UserService
	authService    models.AuthService
}

func InitRoutes(r *gin.Engine, authMiddleware gin.HandlerFunc, messageService models.MessageService, userService models.UserService, authService models.AuthService) {
	app := &App{messageService: messageService, userService: userService, authService: authService}

	r.Use(middlewares.CorsMiddleware())
	// anonymous routes
	ug := r.Group("/api/auth")
	ug.POST("/login", app.LoginUser)
	ug.POST("/register", app.RegisterUser)

	// authenticated routes
	r.Use(authMiddleware)
	mg := r.Group("/api/messages")
	mg.GET("/", app.GetMessages)

	hub := ws.NewHub(messageService)
	go hub.Run()
	r.GET("/ws", func(c *gin.Context) {
		user, exists := c.Get("user")
		if !exists {
			c.Status(http.StatusUnauthorized)
			return
		}
		ws.ServeWs(hub, c.Writer, c.Request, user.(*models.User))
	})
}
