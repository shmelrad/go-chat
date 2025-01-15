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

func (r *messageRepository) CreateMessage(messageDTO *models.MessageDTO) (*models.Message, error) {
	message := models.Message{
		Content: messageDTO.Content,
		UserID:  messageDTO.UserID,
		ChatID:  messageDTO.ChatID,
	}
	if res := r.db.Create(&message).Error; res != nil {
		return nil, fmt.Errorf("failed to create message: %w", res)
	}
	return &message, nil
}

func (r *messageRepository) GetMessageHistory(chatID uint, limit int, offset int) ([]models.Message, error) {
	var messages []models.Message
	if res := r.db.Where("chat_id = ?", chatID).Order("created_at ASC").Limit(limit).Offset(offset).Find(&messages).Error; res != nil {
		return nil, fmt.Errorf("failed to get messages: %w", res)
	}
	return messages, nil
}
