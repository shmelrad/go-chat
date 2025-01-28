package repositories

import (
	"chat-server/models"
	"fmt"
	"log"

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

func (r *chatRepository) UpdateAvatar(chatID uint, avatarURL string) error {
	result := r.db.Model(&models.GroupSettings{}).
		Where("chat_id = ?", chatID).
		Update("avatar_url", avatarURL)

	if result.Error != nil {
		return fmt.Errorf("failed to update avatar: %w", result.Error)
	}
	return nil
}

func (r *chatRepository) AddMember(chatID uint, userID uint, role models.ChatUserRole) (*models.ChatMember, error) {
	member := &models.ChatMember{
		ChatID: chatID,
		UserID: userID,
		Role:   role,
	}

	if err := r.db.Create(member).Error; err != nil {
		return nil, fmt.Errorf("failed to add member: %w", err)
	}

	if err := r.db.Preload("User").First(member, member.ID).Error; err != nil {
		return nil, fmt.Errorf("failed to load member: %w", err)
	}

	return member, nil
}

func (r *chatRepository) GetMember(chatID uint, userID uint) (*models.ChatMember, error) {
	var member models.ChatMember
	if err := r.db.Where("chat_id = ? AND user_id = ?", chatID, userID).First(&member).Error; err != nil {
		return nil, err
	}
	return &member, nil
}

func (r *chatRepository) IsMember(chatID uint, userID uint) bool {
	var count int64
	r.db.Model(&models.ChatMember{}).
		Where("chat_id = ? AND user_id = ?", chatID, userID).
		Count(&count)
	return count > 0
}

func (r *chatRepository) IsAdmin(chatID uint, userID uint) bool {
	var member models.ChatMember
	r.db.Where("chat_id = ? AND user_id = ?", chatID, userID).First(&member)
	log.Println(member.UserID)
	log.Println(member.ChatID)
	log.Println(member.Role)
	return member.Role == models.ChatRoleAdmin
}

func (r *chatRepository) RemoveParticipant(chatID uint, userID uint) error {
	result := r.db.Where("chat_id = ? AND user_id = ?", chatID, userID).
		Delete(&models.ChatMember{})

	if result.Error != nil {
		return fmt.Errorf("failed to remove member: %w", result.Error)
	}
	return nil
}
