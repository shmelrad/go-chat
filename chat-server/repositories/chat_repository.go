package repositories

import (
	"chat-server/models"

	"gorm.io/gorm"
)

type chatRepository struct {
	db *gorm.DB
}

func NewChatRepository(db *gorm.DB) *chatRepository {
	return &chatRepository{db: db}
}

func (r *chatRepository) ChatExists(id uint) (bool, error) {
	var chat models.Chat
	if err := r.db.First(&chat, id).Error; err != nil {
		return false, err
	}
	return true, nil
}

func (r *chatRepository) CreateDmByUsers(senderID uint, receiverID uint) (*models.Chat, error) {
	chat := models.Chat{
		Type: models.ChatTypeDM,
		Members: []models.User{
			{BaseModel: models.BaseModel{ID: senderID}},
			{BaseModel: models.BaseModel{ID: receiverID}},
		},
	}

	if err := r.db.Create(&chat).Error; err != nil {
		return nil, err
	}

	createdChat, err := r.GetById(chat.ID)
	if err != nil {
		return nil, err
	}
	return createdChat, nil
}

func (r *chatRepository) GetById(id uint) (*models.Chat, error) {
	var chat models.Chat
	if err := r.db.Preload("Members").Preload("LastMessage").First(&chat, id).Error; err != nil {
		return nil, err
	}
	return &chat, nil
}

func (r *chatRepository) UpdateChat(chat *models.Chat) error {
	return r.db.Save(chat).Error
}

func (r *chatRepository) GetDmByIds(userID uint, recipientID uint) (*models.Chat, error) {
	var chat models.Chat
	err := r.db.Joins("JOIN chat_members cm1 ON cm1.chat_id = chats.id AND cm1.user_id = ?", userID).
		Joins("JOIN chat_members cm2 ON cm2.chat_id = chats.id AND cm2.user_id = ?", recipientID).
		Where("chats.type = ?", models.ChatTypeDM).
		Preload("Members").
		First(&chat).Error
	if err != nil {
		return nil, err
	}
	return &chat, nil
}
