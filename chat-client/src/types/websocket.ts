export type WebSocketAction = 'send_message'

export interface WebSocketMessage<T = unknown> {
  action: WebSocketAction
  data: T
}

export interface SendMessageData {
  content: string
} 