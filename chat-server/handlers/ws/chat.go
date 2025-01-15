package ws

import (
	"chat-server/models"
	"net/http"

	"github.com/gorilla/websocket"
)

type Hub struct {
	clients     map[uint]*Client
	upgrader    websocket.Upgrader
	register    chan *Client
	unregister  chan *Client
	userService models.UserService
	chatService models.ChatService
}

func NewHub(userService models.UserService, chatService models.ChatService) *Hub {
	return &Hub{
		clients: make(map[uint]*Client),
		upgrader: websocket.Upgrader{
			CheckOrigin: func(r *http.Request) bool {
				return true // for demo purposes (vite takes port 5173)
			},
			ReadBufferSize:  1024,
			WriteBufferSize: 1024,
		},
		register:    make(chan *Client),
		unregister:  make(chan *Client),
		userService: userService,
		chatService: chatService,
	}
}

func (hub *Hub) Run() {
	for {
		select {
		case client := <-hub.register:
			hub.registerClient(client)
		case client := <-hub.unregister:
			hub.unregisterClient(client.user.ID)
		}
	}
}

func (h *Hub) registerClient(client *Client) {
	h.clients[client.user.ID] = client
}

func (h *Hub) unregisterClient(id uint) {
	if client, ok := h.clients[id]; ok {
		delete(h.clients, id)
		close(client.send)
	}
}

func (h *Hub) broadcastToChat(chatID uint, message models.WebSocketMessage) error {
	chat, err := h.chatService.GetChatById(chatID)
	if err != nil {
		return err
	}

	for _, user := range chat.Members {
		client, ok := h.clients[user.ID]
		if !ok {
			continue
		}
		client.send <- message.Encode()
	}

	return nil
}
