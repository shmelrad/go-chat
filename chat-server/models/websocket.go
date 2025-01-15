package models

import (
	"encoding/json"
	"log"
)

type WebSocketMessage struct {
	Action    string `json:"action"`
	// random uuid for the message
	MessageID string `json:"message_id"`
	Data      any    `json:"data"`
}

func (message *WebSocketMessage) Encode() []byte {
	encoding, err := json.Marshal(message)
	if err != nil {
		log.Println(err)
	}

	return encoding
}

type SendMessageData struct {
	ChatID  uint   `json:"chat_id"`
	Content string `json:"content"`
}