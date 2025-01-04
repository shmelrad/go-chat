package services

import "chat-server/models"

type messageService struct {
	messageRepository models.MessageRepository
}

func NewMessageService(messageRepository models.MessageRepository) *messageService {
	return &messageService{messageRepository: messageRepository}
}

func (s *messageService) CreateMessage(message *models.Message) *models.AppError {
	if err := s.messageRepository.CreateMessage(message); err != nil {
		return models.ErrServerError
	}
	return nil
}

func (s *messageService) GetMessageById(id uint) (*models.Message, *models.AppError) {
	message, err := s.messageRepository.GetById(id)
	if err != nil {
		return nil, models.ErrServerError
	}
	return message, nil
}

func (s *messageService) GetMessages() ([]models.Message, *models.AppError) {
	messages, err := s.messageRepository.GetMessages()
	if err != nil {
		return nil, models.ErrServerError
	}
	return messages, nil
}
