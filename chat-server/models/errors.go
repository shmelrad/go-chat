package models

type AppError struct {
	Code    int    `json:"code"`
	Message string `json:"error"`
}

func NewAppError(code int, message string) *AppError {
	return &AppError{
		Code:    code,
		Message: message,
	}
}

var (
	ErrInvalidCredentials = NewAppError(401, "invalid credentials")
	ErrUserNotFound       = NewAppError(404, "user not found")
	ErrUserExists         = NewAppError(409, "user already exists")
	ErrInvalidInput       = NewAppError(400, "invalid input")
	ErrServerError        = NewAppError(500, "internal server error")
) 