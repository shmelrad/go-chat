package models

import "gorm.io/gorm"

type Message struct {
	gorm.Model
	Author  string `json:"author"`
	Content string `json:"content"`
}

type MessageRepository interface {
	GetById(id uint) (*Message, error)
	CreateMessage(message *Message) error
	GetMessages() ([]Message, error)
}

type MessageService interface {
	CreateMessage(message *Message) error
	GetMessageById(id uint) (*Message, error)
	GetMessages() ([]Message, error)
}
