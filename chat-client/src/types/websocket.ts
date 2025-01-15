import { Message } from "./message"

export type WebSocketAction = 'send_message' | 'send_message_error' | 'new_message' | 'broadcast_error'

export interface WebSocketMessage<T = unknown> {
  action: WebSocketAction
  message_id?: string
  data: T
}

export interface SendMessageData {
  content: string
  chat_id: number
}

export interface NewMessageData {
  message: Message
}

export interface SendMessageErrorData {
  error: string
  message_id: string
} 