package models

type Message struct {
	BaseModel
	Content string `json:"content"`
	UserID  uint   `json:"user_id" gorm:"not null"`
	ChatID  uint   `json:"chat_id" gorm:"not null;constraint:OnDelete:CASCADE;"`
}

type MessageDTO struct {
	Content string `json:"content"`
	UserID  uint   `json:"user_id" gorm:"not null"`
	ChatID  uint   `json:"chat_id" gorm:"not null"`
}

type MessageRepository interface {
	GetById(id uint) (*Message, error)
	CreateMessage(messageDTO *MessageDTO) (*Message, error)
	GetMessageHistory(chatID uint, limit int, offset int) ([]Message, error)
}

type MessageService interface {
	GetMessageHistory(chatID uint, limit int, offset int) ([]Message, *AppError)
}
