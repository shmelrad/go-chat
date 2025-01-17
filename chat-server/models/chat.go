package models

type ChatType string

const (
	ChatTypeDM    ChatType = "dm"
	ChatTypeGroup ChatType = "group"
)

type ChatUserRole string

const (
	ChatRoleMember ChatUserRole = "member"
	ChatRoleAdmin  ChatUserRole = "admin"
)

// Combined entity for both DM and group chats
type Chat struct {
	BaseModel
	Type          ChatType      `json:"type" gorm:"type:varchar(10);not null"`
	Name          string        `json:"name,omitempty" gorm:"type:varchar(100)"`
	LastMessageID *uint         `json:"last_message_id"`
	LastMessage   *Message      `json:"last_message" gorm:"foreignKey:LastMessageID"`
	Members       []ChatMember  `json:"members" gorm:"foreignKey:ChatID"`
	Messages      []Message     `json:"messages" gorm:"constraint:OnDelete:CASCADE;"`
	Settings      GroupSettings `json:"settings" gorm:"foreignKey:ChatID"`
}

type ChatMember struct {
	BaseModel
	ChatID uint         `json:"chat_id" gorm:"primaryKey"`
	UserID uint         `json:"user_id" gorm:"primaryKey"`
	Role   ChatUserRole `json:"role" gorm:"type:varchar(20);not null;default:'member'"`
	Chat   Chat         `json:"chat" gorm:"foreignKey:ChatID"`
	User   User         `json:"user" gorm:"foreignKey:UserID"`
}

// Settings for group chats
type GroupSettings struct {
	BaseModel
	ChatID      uint   `json:"chat_id" gorm:"uniqueIndex"`
	Chat        *Chat  `gorm:"foreignKey:ChatID;constraint:OnDelete:CASCADE;"`
	Description string `json:"description"`
	IsPublic    bool   `json:"is_public"`
}

type ChatSearchResult struct {
	Type      ChatType `json:"type"`
	ID        uint     `json:"id"`
	Name      string   `json:"name"`
	AvatarURL string   `json:"avatar_url"`
}

type ChatRepository interface {
	CreateDmByUsers(senderID uint, receiverID uint) (*Chat, error)
	GetById(id uint) (*Chat, error)
	UpdateLastMessage(id uint, messageID uint) error
	GetDmByIds(userID uint, recipientID uint) (*Chat, error)
	CreateGroupChat(creatorID uint, name string) (*Chat, error)
}

type ChatService interface {
	GetDmByIds(userID uint, recipientID uint) (*Chat, *AppError)
	CreateDmByUsers(senderID uint, receiverID uint) (*Chat, *AppError)
	GetChatById(id uint) (*Chat, *AppError)
	CreateGroupChat(creatorID uint, name string) (*Chat, *AppError)
}
