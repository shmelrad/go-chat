package main

import (
	"log"
	"net/http"
	"chat-server/config"
	"chat-server/routes"
)

func main() {
	config.InitDB()

	router := routes.InitRoutes()

	log.Println("Server is running on port 8080")
	log.Fatal(http.ListenAndServe(":8080", router))
}
