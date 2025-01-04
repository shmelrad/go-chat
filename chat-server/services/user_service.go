package services

import "chat-server/models"

type userService struct {
	userRepository models.UserRepository
}

func NewUserService(userRepository models.UserRepository) *userService {
	return &userService{
		userRepository: userRepository,
	}
}