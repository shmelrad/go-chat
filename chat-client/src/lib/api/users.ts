import { Chat, ChatSearchResult } from '@/types/chat'
import { BaseApi } from './base'

interface SearchUsersResponse {
  users: ChatSearchResult[]
}

interface GetChatsResponse {
  chats: Chat[]
}

class UsersApi extends BaseApi {
  constructor() {
    super('/api/users')
  }

  searchUsers({ q, offset }: { q: string, offset: number }) {
    return this.get<SearchUsersResponse>('/search', { 
      auth: true,
      params: {
        q,
        offset
      }
    })
  }

  getChats() {
    return this.get<GetChatsResponse>('/chats', { auth: true })
  }
}

export const usersApi = new UsersApi()