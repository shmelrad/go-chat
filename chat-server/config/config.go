package config

import (
	"chat-server/models"
	"fmt"
	"log"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func InitDB() (*gorm.DB, error) {
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC",
		os.Getenv("DB_HOST"),
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_NAME"),
		os.Getenv("DB_PORT"),
	)

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})

	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %v", err)
	}

	db.DisableForeignKeyConstraintWhenMigrating = true
	if err = db.AutoMigrate(
		&models.Message{},
		&models.Chat{},
		&models.User{},
		&models.ChatMember{},
		&models.GroupSettings{},
	); err != nil {
		return nil, fmt.Errorf("error migrating models: %w", err)
	}


	log.Println("Database connected!")
	return db, nil
}

func GetConfig() map[string]string {
	return map[string]string{
		"JWT_SECRET": os.Getenv("JWT_SECRET"),
	}
}
