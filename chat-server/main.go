package main

import (
	"chat-server/config"
	"chat-server/repositories"
	"chat-server/services"
	"chat-server/handlers"
	"chat-server/handlers/middlewares"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)


func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatalln("Error loading .env file")
	}

	db, err := config.InitDB()
	config := config.GetConfig()

	router := gin.Default()

	messageRepository := repositories.NewMessageRepository(db)
	userRepository := repositories.NewUserRepository(db)
	chatRepository := repositories.NewChatRepository(db)

	messageService := services.NewMessageService(messageRepository)
	authService := services.NewAuthService(userRepository, config["JWT_SECRET"])
	userService := services.NewUserService(userRepository, messageRepository, chatRepository, authService)
	chatService := services.NewChatService(chatRepository, userRepository)

	authMiddleware := middlewares.AuthMiddleware(config["JWT_SECRET"], userRepository)
	handlers.InitRoutes(router, authMiddleware, messageService, userService, authService, chatService)

	if err != nil {
		log.Fatal("Failed to connect to database: ", err)
	}

	log.Println("Server is running on port 8080")
	router.Run(":8080")
}
