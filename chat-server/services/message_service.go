package services

import "chat-server/models"

type messageService struct {
	messageRepository models.MessageRepository
}

func NewMessageService(messageRepository models.MessageRepository) *messageService {
	return &messageService{messageRepository: messageRepository}
}

func (s *messageService) GetMessageById(id uint) (*models.Message, *models.AppError) {
	message, err := s.messageRepository.GetById(id)
	if err != nil {
		return nil, models.ErrServerError
	}
	return message, nil
}

func (s *messageService) GetMessageHistory(chatID uint, limit int, offset int) ([]models.Message, *models.AppError) {
	messages, err := s.messageRepository.GetMessageHistory(chatID, limit, offset)
	if err != nil {
		return nil, models.ErrServerError
	}
	return messages, nil
}
