package models

type WebSocketMessage struct {
	Action string      `json:"action"`
	Data   interface{} `json:"data"`
}

type SendMessageData struct {
	Content string `json:"content"`
}
