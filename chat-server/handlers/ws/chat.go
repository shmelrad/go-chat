package ws

import (
	"chat-server/models"
	"net/http"

	"github.com/gorilla/websocket"
)

type Hub struct {
	clients  map[*Client]bool
	upgrader websocket.Upgrader
	register       chan *Client
	unregister     chan *Client
	broadcast      chan []byte
	messageService models.MessageService
}

func NewHub(messageService models.MessageService) *Hub {
	return &Hub{
		clients: make(map[*Client]bool),
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true // for demo purposes (vite takes port 5173)
			},
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
		},
		register:       make(chan *Client),
		unregister:     make(chan *Client),
		broadcast:      make(chan []byte),
		messageService: messageService,
	}
}

func (hub *Hub) Run() {
	for {
		select {

		case client := <-hub.register:
			hub.registerClient(client)

		case client := <-hub.unregister:
			hub.unregisterClient(client)

		case message := <-hub.broadcast:
			hub.broadcastMessage(message)
		}
	}
}

func (h *Hub) registerClient(client *Client) {
	h.clients[client] = true
}

func (h *Hub) unregisterClient(client *Client) {
	if _, ok := h.clients[client]; ok {
		delete(h.clients, client)
		close(client.send)
	}
}

func (h *Hub) broadcastMessage(message []byte) {
	for client := range h.clients {
		client.send <- message
	}
}