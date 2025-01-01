package handlers

import (
	"chat-server/config"
	"chat-server/models"
	"encoding/json"
	"net/http"
	"sync"

	"github.com/gorilla/websocket"
)

type Hub struct {
	clients  map[*Client]bool
	mutex    sync.RWMutex
	upgrader websocket.Upgrader
}

type Client struct {
	conn *websocket.Conn
	hub  *Hub
	mu   sync.Mutex
}

func NewHub() *Hub {
	return &Hub{
		clients: make(map[*Client]bool),
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true // for demo purposes
			},
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
		},
	}
}

func GetMessages(w http.ResponseWriter, r *http.Request) {
	var messages []models.Message
	if err := config.DB.Find(&messages).Error; err != nil {
		http.Error(w, "Failed to fetch messages", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(messages)
}

func (h *Hub) broadcastMessage(message models.Message) {
	h.mutex.Lock()
	defer h.mutex.Unlock()

	for client := range h.clients {
		client.mu.Lock()
		err := client.conn.WriteJSON(message)
		client.mu.Unlock()

		if err != nil {
			client.conn.Close()
			delete(h.clients, client)
		}
	}
}

func ChatHandler(hub *Hub) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		conn, err := hub.upgrader.Upgrade(w, r, nil)
		if err != nil {
			http.Error(w, "Could not upgrade connection", http.StatusInternalServerError)
			return
		}

		client := &Client{
			conn: conn,
			hub:  hub,
		}

		hub.mutex.Lock()
		hub.clients[client] = true
		hub.mutex.Unlock()

		defer func() {
			hub.mutex.Lock()
			delete(hub.clients, client)
			hub.mutex.Unlock()
			conn.Close()
		}()

		for {
			var message models.Message
			if err := conn.ReadJSON(&message); err != nil {
				break
			}

			if err := config.DB.Create(&message).Error; err != nil {
				break
			}

			hub.broadcastMessage(message)
		}
	}
}
