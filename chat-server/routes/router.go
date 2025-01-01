package routes

import (
	"chat-server/handlers"
	"net/http"

	"github.com/gorilla/mux"
)

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func InitRoutes() *mux.Router {
	router := mux.NewRouter()

	router.Use(corsMiddleware)

	hub := handlers.NewHub()
	router.HandleFunc("/messages", handlers.GetMessages).Methods("GET", "OPTIONS")
	router.HandleFunc("/ws", handlers.ChatHandler(hub))

	return router
}
