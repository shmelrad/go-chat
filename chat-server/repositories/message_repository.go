package repositories

import (
	"chat-server/models"
	"fmt"

	"gorm.io/gorm"
)

type messageRepository struct {
	db *gorm.DB
}

func NewMessageRepository(db *gorm.DB) models.MessageRepository {
	return &messageRepository{db: db}
}

func (r *messageRepository) GetById(id uint) (*models.Message, error) {
	var message models.Message
	if res := r.db.First(&message, id).Error; res != nil {
		return nil, fmt.Errorf("failed to get message: %w", res)
	}
	return &message, nil
}

func (r *messageRepository) CreateMessage(message *models.Message) error {
	if res := r.db.Create(message).Error; res != nil {
		return fmt.Errorf("failed to create message: %w", res)
	}
	return nil
}

func (r *messageRepository) GetMessages() ([]models.Message, error) {
	var messages []models.Message
	if res := r.db.Find(&messages).Error; res != nil {
		return nil, fmt.Errorf("failed to get messages: %w", res)
	}
	return messages, nil
}
