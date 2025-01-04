package repositories

import (
	"chat-server/models"
	"fmt"

	"gorm.io/gorm"
)

type userRepository struct {
	db *gorm.DB
}

func NewUserRepository(db *gorm.DB) models.UserRepository {
	return &userRepository{db: db}
}

func (r *userRepository) CreateUser(user *models.User) (*models.User, error) {
	if res := r.db.Create(user).Error; res != nil {
		return nil, fmt.Errorf("failed to create user: %w", res)
	}
	return user, nil
}

func (r *userRepository) EmailExists(email string) bool {
	var user models.User
	return r.db.Where("email = ?", email).First(&user).Error == nil
}

func (r *userRepository) UsernameExists(username string) bool {
	var user models.User
	return r.db.Where("username = ?", username).First(&user).Error == nil
}

func (r *userRepository) GetUserByEmail(email string) (*models.User, error) {
	var user models.User
	if res := r.db.Where("email = ?", email).First(&user).Error; res != nil {
		return nil, fmt.Errorf("failed to get user: %w", res)
	}
	return &user, nil
}

func (r *userRepository) GetUserByUsername(username string) (*models.User, error) {
	var user models.User
	if res := r.db.Where("username = ?", username).First(&user).Error; res != nil {
		return nil, fmt.Errorf("failed to get user: %w", res)
	}
	return &user, nil
}

func (r *userRepository) GetUserById(id uint) (*models.User, error) {
	var user models.User
	if res := r.db.Where("id = ?", id).First(&user).Error; res != nil {
		return nil, fmt.Errorf("failed to get user: %w", res)
	}
	return &user, nil
}

