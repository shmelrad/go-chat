package models

type Message struct {
	BaseModel
	Author string `json:"author"`
	Content  string `json:"content"`
}
