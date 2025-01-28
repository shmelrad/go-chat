package services

import (
	"chat-server/models"

	"gorm.io/gorm"
)

type chatService struct {
	userRepository models.UserRepository
	chatRepository models.ChatRepository
}

func NewChatService(chatRepository models.ChatRepository, userRepository models.UserRepository) models.ChatService {
	return &chatService{chatRepository: chatRepository, userRepository: userRepository}
}

func (s *chatService) GetDmByIds(userID uint, recipientID uint) (*models.Chat, *models.AppError) {
	chat, err := s.chatRepository.GetDmByIds(userID, recipientID)
	if err == gorm.ErrRecordNotFound {
		return nil, models.ErrNotFound
	}
	if err != nil {
		return nil, models.ErrServerError
	}
	return chat, nil
}

func (s *chatService) CreateDmByUsers(senderID uint, receiverID uint) (*models.Chat, *models.AppError) {
	if !s.userRepository.UserExists(receiverID) {
		return nil, models.ErrServerError
	}
	chat, err := s.chatRepository.CreateDmByUsers(senderID, receiverID)
	if err != nil {
		return nil, models.ErrServerError
	}
	return chat, nil
}

func (s *chatService) GetChatById(id uint) (*models.Chat, *models.AppError) {
	chat, err := s.chatRepository.GetById(id)
	if err == gorm.ErrRecordNotFound {
		return nil, models.ErrNotFound
	}
	return chat, nil
}

func (s *chatService) CreateGroupChat(creatorID uint, name string) (*models.Chat, *models.AppError) {
	chat, err := s.chatRepository.CreateGroupChat(creatorID, name)
	if err != nil {
		return nil, models.ErrServerError
	}
	return chat, nil
}

func (s *chatService) UpdateAvatar(chatID uint, avatarURL string) *models.AppError {
	_, err := s.chatRepository.GetById(chatID)
	if err != nil {
		return models.ErrNotFound
	}

	if err := s.chatRepository.UpdateAvatar(chatID, avatarURL); err != nil {
		return models.ErrServerError
	}

	return nil
}

func (s *chatService) AddParticipant(chatID uint, username string) (*models.ChatMember, *models.AppError) {
	user, err := s.userRepository.GetUserByUsername(username)
	if s.IsMember(chatID, user.ID) {
		return nil, models.ErrAlreadyMember
	}
	if err != nil {
		return nil, models.ErrNotFound
	}

	member, err := s.chatRepository.AddMember(chatID, user.ID, models.ChatRoleMember)
	if err != nil {
		return nil, models.ErrServerError
	}

	return member, nil
}

func (s *chatService) RemoveParticipant(chatID uint, userID uint) *models.AppError {
	_, err := s.chatRepository.GetById(chatID)
	if err != nil {
		return models.ErrNotFound
	}

	if err := s.chatRepository.RemoveParticipant(chatID, userID); err != nil {
		return models.ErrServerError
	}

	return nil
}

func (s *chatService) IsMember(chatID uint, userID uint) bool {
	return s.chatRepository.IsMember(chatID, userID)
}

func (s *chatService) IsAdmin(chatID uint, userID uint) bool {
	return s.chatRepository.IsAdmin(chatID, userID)
}

