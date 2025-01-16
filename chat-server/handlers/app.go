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
	chatService    models.ChatService
}

func InitRoutes(r *gin.Engine, authMiddleware gin.HandlerFunc, messageService models.MessageService, userService models.UserService, authService models.AuthService, chatService models.ChatService) {
	app := &App{
		messageService: messageService,
		userService:    userService,
		authService:    authService,
		chatService:    chatService,
	}

	r.Use(middlewares.CorsMiddleware())
	r.Static("/assets/images", "./assets/images")
	// anonymous routes
	ag := r.Group("/api/auth")
	ag.POST("/login", app.LoginUser)
	ag.POST("/register", app.RegisterUser)

	// authenticated routes
	r.Use(authMiddleware)
	mg := r.Group("/api/messages")
	mg.GET("/", app.GetMessageHistory)

	ug := r.Group("/api/users")
	ug.GET("/chats", app.GetChats)
	ug.GET("/search", app.SearchUsers)
	ug.POST("/avatar", app.UploadAvatar)

	ch := r.Group("/api/chats")
	ch.GET("/:chat_id", app.GetChatById)
	ch.GET("/dm-with-user/:recipient_id", app.GetDmWithUser)
	ch.POST("/create-dm", app.CreateDmWithUser)

	hub := ws.NewHub(userService, chatService)
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
