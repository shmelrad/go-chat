# go-chat

Real-time chat chat writen in Go and React.

## Features

- 💬 Direct messages (using websocket)
- 🔐 Authentication
- 🖼️ Avatars
- 😊 Emoji picker
- 📝 Markdown support
- 🌜 Light and dark theme

## Stack

### Server

- Gin for HTTP server
- Gorilla WebSocket for websocket communication
- golang-jwt for authentication
- Gorm + Postgres for database

### Web

- React + TypeScript
- Tailwind + shadcn/ui for nice predefined components and styling
- Zustand + React Query for state management

## Installation

### Server

1. Install Postgres and create empty database
2. Rename `.env.example` to `.env` and fill in the values
3. Run `go run main.go` in `chat-server` directory to start the server

### Web

1. Install yarn
2. Go to `chat-client` directory
3. Run `yarn` to install the dependencies
4. Run `yarn dev` to start the client
5. Go to `localhost:5173`