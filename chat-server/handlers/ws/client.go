package ws

import (
	"chat-server/models"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

const (
	// Time allowed to write a message to the peer.
	writeWait = 10 * time.Second

	// Time allowed to read the next pong message from the peer.
	pongWait = 60 * time.Second

	// Send pings to peer with this period. Must be less than pongWait.
	pingPeriod = (pongWait * 9) / 10

	// Maximum message size allowed from peer.
	maxMessageSize = 8192
)

type Client struct {
	conn *websocket.Conn
	hub  *Hub
	send chan []byte
	user *models.User
}

// readPump pumps messages from the websocket connection to the hub.
//
// The application runs readPump in a per-connection goroutine. The application
// ensures that there is at most one reader on a connection by executing all
// reads from this goroutine.
func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()
	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetPongHandler(func(string) error { c.conn.SetReadDeadline(time.Now().Add(pongWait)); return nil })
	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}

		c.handleMessage(message)
	}
}

// writePump pumps messages from the hub to the websocket connection.
//
// A goroutine running writePump is started for each connection. The
// application ensures that there is at most one writer to a connection by
// executing all writes from this goroutine.
func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()
	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// The hub closed the channel.
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			if err := c.conn.WriteMessage(websocket.TextMessage, message); err != nil {
				return
			}

		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

func (c *Client) handleMessage(message []byte) {
	var wsMessage models.WebSocketMessage
	if err := json.Unmarshal(message, &wsMessage); err != nil {
		log.Println("Error unmarshaling message:", err)
		return
	}

	switch wsMessage.Action {
	case "send_message":
		handleTypedAction(wsMessage.Data, c.handleSendMessage)
	default:
		log.Printf("Unknown action: %s", wsMessage.Action)
	}
}

func handleTypedAction[T any](wsData interface{}, handler func(T) error) {
	var data T
	dataBytes, err := json.Marshal(wsData)
	if err != nil {
		log.Println("Error marshaling data:", err)
		return
	}
	if err := json.Unmarshal(dataBytes, &data); err != nil {
		log.Println("Error unmarshaling action data:", err)
		return
	}
	if err := handler(data); err != nil {
		log.Println(err)
	}
}

func (c *Client) handleSendMessage(data models.SendMessageData) error {
	msg := &models.MessageDTO{
		Content: data.Content,
		UserID:  c.user.ID,
		ChatID:  data.ChatID,
	}

	createdMessage, appErr := c.hub.userService.SendMessage(msg)
	if appErr != nil {
		errorMsg := models.WebSocketMessage{
			Action: "send_message_error",
			Data: gin.H{
				"error": appErr.Message,
			},
		}
		c.send <- errorMsg.Encode()
		return fmt.Errorf("error creating message: %s", appErr.Message)
	}

	broadcastMsg := models.WebSocketMessage{
		Action: "new_message",
		Data: gin.H{
			"message":   createdMessage,
		},
	}
	err := c.hub.broadcastToChat(data.ChatID, broadcastMsg)
	if err != nil {
		errorMsg := models.WebSocketMessage{
			Action: "broadcast_error",
			Data:   gin.H{"error": err.Error()},
		}
		c.send <- errorMsg.Encode()
	}
	return nil
}

// serveWs handles websocket requests from the peer.
func ServeWs(hub *Hub, w http.ResponseWriter, r *http.Request, user *models.User) {
	conn, err := hub.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Println(err)
		return
	}

	client := &Client{
		hub:  hub,
		conn: conn,
		send: make(chan []byte, 256),
		user: user,
	}

	hub.register <- client

	go client.writePump()
	go client.readPump()
}
