import { BaseApi } from './base'
import { Message } from '@/types/message'

interface MessagesResponse {
  messages: Message[]
}

class MessagesApi extends BaseApi {
  constructor() {
    super('/api/messages')
  }

  getMessages() {
    return this.get<MessagesResponse>('/', { auth: true })
  }
}

export const messagesApi = new MessagesApi() 