package models

type Message struct {
	BaseModel
	Author  string `json:"author"`
	Content string `json:"content"`
}

type MessageRepository interface {
	GetById(id uint) (*Message, error)
	CreateMessage(message *Message) error
	GetMessages() ([]Message, error)
}

type MessageService interface {
	CreateMessage(message *Message) *AppError
	GetMessageById(id uint) (*Message, *AppError)
	GetMessages() ([]Message, *AppError)
}
