package services

import (
	"chat-server/models"
	"fmt"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
)

type authService struct {
	userRepository models.UserRepository
	secret         string
}

func NewAuthService(userRepository models.UserRepository, secret string) *authService {
	return &authService{
		userRepository: userRepository,
		secret:         secret,
	}
}

func (s *authService) RegisterUser(email, username, password string) (*models.User, *models.AppError) {
	if s.userRepository.EmailExists(email) {
		return nil, models.NewAppError(409, fmt.Sprintf("user with email %s already exists", email))
	}

	if s.userRepository.UsernameExists(username) {
		return nil, models.NewAppError(409, fmt.Sprintf("user with username %s already exists", username))
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return nil, models.ErrServerError
	}

	user := &models.User{
		Email:        email,
		Username:     username,
		PasswordHash: string(hashedPassword),
	}

	createdUser, err := s.userRepository.CreateUser(user)
	if err != nil {
		return nil, models.ErrServerError
	}
	return createdUser, nil
}

func (s *authService) createToken(user *models.User) (string, error) {
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"username":   user.Username,
		"email":      user.Email,
		"sub":        user.ID,
		"avatar_url": user.AvatarURL,
		"exp":        time.Now().Add(time.Hour * 1).Unix(),
	})

	return token.SignedString([]byte(s.secret))
}

func (s *authService) LoginUser(username, password string) (string, *models.AppError) {
	user, err := s.userRepository.GetUserByUsername(username)
	if err != nil {
		return "", models.ErrInvalidCredentials
	}

	if bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(password)) != nil {
		return "", models.ErrInvalidCredentials
	}

	tokenString, err := s.createToken(user)
	if err != nil {
		return "", models.ErrServerError
	}

	return tokenString, nil
}

func (s *authService) CreateTokenForUser(user *models.User) (string, *models.AppError) {
	tokenString, err := s.createToken(user)
	if err != nil {
		return "", models.ErrServerError
	}
	return tokenString, nil
}
