import { BaseApi } from './base'
import { Message } from '@/types/message'

export interface MessagesResponse {
  messages: Message[]
}

class MessagesApi extends BaseApi {
  constructor() {
    super('/api/messages')
  }

  getMessages(chatId?: number) {
    const params = chatId ? { chat_id: chatId, offset: 0 } : undefined
    return this.get<MessagesResponse>('/', { auth: true, params })
  }
}

export const messagesApi = new MessagesApi() 