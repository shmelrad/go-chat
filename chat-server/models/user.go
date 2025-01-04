package models


type User struct {
	BaseModel
	Username     string `json:"username" gorm:"unique;not null"`
	Email        string `json:"email" gorm:"unique;not null"`
	PasswordHash string `json:"-" gorm:"not null"`
}

type UserService interface {

}

type UserRepository interface {
	CreateUser(user *User) (*User, error)
	GetUserByEmail(email string) (*User, error)
	GetUserByUsername(username string) (*User, error)
	GetUserById(id uint) (*User, error)
	EmailExists(email string) bool
	UsernameExists(username string) bool
}


