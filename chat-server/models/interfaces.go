package models

type AuthService interface {
	RegisterUser(email, username, password string) (*User, *AppError)
	LoginUser(username, password string) (string, *AppError)
}
