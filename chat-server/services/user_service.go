package services

import "chat-server/models"

type userService struct {
	userRepository models.UserRepository
	messageRepository models.MessageRepository
	chatRepository models.ChatRepository
}

func NewUserService(userRepository models.UserRepository, messageRepository models.MessageRepository, chatRepository models.ChatRepository) *userService {
	return &userService{
		userRepository: userRepository,
		messageRepository: messageRepository,
		chatRepository: chatRepository,
	}
}

func (s *userService) SendMessage(message *models.MessageDTO) (*models.Message, *models.AppError) {
	chat, err := s.chatRepository.GetById(message.ChatID)
	if err != nil {
		return nil, models.ErrServerError
	}

	createdMessage, err := s.messageRepository.CreateMessage(message)
	if err != nil {
		return nil, models.ErrServerError
	}
	chat.LastMessageID = &createdMessage.ID
	err = s.chatRepository.UpdateChat(chat)
	if err != nil {
		return nil, models.ErrServerError
	}
	return createdMessage, nil
}

func (s *userService) SearchUsers(query string, limit int, offset int) ([]models.ChatSearchResult, *models.AppError) {
	users, err := s.userRepository.SearchUsers(query, limit, offset)
	if err != nil {
		return nil, models.ErrServerError
	}
	return users, nil
}

func (s *userService) GetChats(userID uint) ([]models.Chat, *models.AppError) {
	chats, err := s.userRepository.GetChats(userID)
	if err != nil {
		return nil, models.ErrServerError
	}
	return chats, nil
}