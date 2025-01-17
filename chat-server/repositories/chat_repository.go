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
		Members: []models.ChatMember{
			{UserID: senderID, Role: models.ChatRoleMember},
			{UserID: receiverID, Role: models.ChatRoleMember},
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
	if err := r.db.Preload("Members.User").Preload("LastMessage").First(&chat, id).Error; err != nil {
		return nil, err
	}
	return &chat, nil
}

func (r *chatRepository) UpdateLastMessage(id uint, messageID uint) error {
	return r.db.Debug().Model(&models.Chat{}).Where("id = ?", id).Update("last_message_id", messageID).Error
}

func (r *chatRepository) GetDmByIds(userID uint, recipientID uint) (*models.Chat, error) {
	var chat models.Chat
	err := r.db.Joins("JOIN chat_members cm1 ON cm1.chat_id = chats.id AND cm1.user_id = ?", userID).
		Joins("JOIN chat_members cm2 ON cm2.chat_id = chats.id AND cm2.user_id = ?", recipientID).
		Where("chats.type = ?", models.ChatTypeDM).
		Preload("Members.User").
		First(&chat).Error
	if err != nil {
		return nil, err
	}
	return &chat, nil
}

func (r *chatRepository) CreateGroupChat(creatorID uint, name string) (*models.Chat, error) {
	chat := models.Chat{
		Type: models.ChatTypeGroup,
		Name: name,
		Members: []models.ChatMember{
			{UserID: creatorID, Role: models.ChatRoleAdmin},
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
