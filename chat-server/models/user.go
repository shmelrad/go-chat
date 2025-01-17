package models

type User struct {
	BaseModel
	Username     string       `json:"username" gorm:"unique;not null"`
	Email        string       `json:"-" gorm:"unique;not null"`
	PasswordHash string       `json:"-" gorm:"not null"`
	AvatarURL    string       `json:"avatar_url"`
	Chats        []Chat       `json:"chats" gorm:"many2many:chat_members;joinForeignKey:UserID;JoinReferences:ChatID"`
}

type UserService interface {
	SearchUsers(query string, limit int, offset int) ([]ChatSearchResult, *AppError)
	SendMessage(message *MessageDTO) (*Message, *AppError)
	GetChats(userID uint) ([]Chat, *AppError)
	UpdateAvatar(userID uint, avatarURL string) (string, *AppError)
}

type UserRepository interface {
	CreateUser(user *User) (*User, error)
	GetUserByEmail(email string) (*User, error)
	GetUserByUsername(username string) (*User, error)
	GetUserById(id uint) (*User, error)
	EmailExists(email string) bool
	UsernameExists(username string) bool
	UserExists(id uint) bool
	SearchUsers(query string, limit int, offset int) ([]ChatSearchResult, error)
	GetChats(userID uint) ([]Chat, error)
	UpdateAvatar(userID uint, avatarURL string) error
}
