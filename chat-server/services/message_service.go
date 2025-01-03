package services

import "chat-server/models"

type messageService struct {
	messageRepository models.MessageRepository
}

func NewMessageService(messageRepository models.MessageRepository) *messageService {
	return &messageService{messageRepository: messageRepository}
}

func (s *messageService) CreateMessage(message *models.Message) error {
	return s.messageRepository.CreateMessage(message)
}

func (s *messageService) GetMessageById(id uint) (*models.Message, error) {
	return s.messageRepository.GetById(id)
}

func (s *messageService) GetMessages() ([]models.Message, error) {
	return s.messageRepository.GetMessages()
}

