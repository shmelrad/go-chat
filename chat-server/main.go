package main

import (
	"chat-server/config"
	"chat-server/repositories"
	"chat-server/services"
	"chat-server/handlers"
	"log"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)


func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatalln("Error loading .env file")
	}

	db, err := config.InitDB()

	router := gin.Default()
	messageRepository := repositories.NewMessageRepository(db)
	messageService := services.NewMessageService(messageRepository)
	handlers.InitRoutes(router, messageService)

	if err != nil {
		log.Fatal("Failed to connect to database: ", err)
	}

	log.Println("Server is running on port 8080")
	router.Run(":8080")
}
