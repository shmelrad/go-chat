import { Chat } from '@/types/chat'
import { BaseApi } from './base'

interface GetChatResponse {
    chat: Chat
}

interface CreateGroupChatRequest {
    name: string
}

class ChatsApi extends BaseApi {
    constructor() {
        super('/api/chats')
    }

    getChat(chatId: number) {
        return this.get<GetChatResponse>(`/${chatId}`, {
            auth: true,
        })
    }

    getDmWithUser(recipientId: number) {
        return this.get<GetChatResponse>(`/dm-with-user/${recipientId}`, {
            auth: true,
        })
    }

    createDmWithUser(recipientId: number) {
        return this.post<GetChatResponse>(`/create-dm`, {
            recipientId,
        }, { auth: true })
    }

    createGroupChat(data: CreateGroupChatRequest) {
        return this.post<GetChatResponse>('/create-group-chat', data, { auth: true })
    }
}

export const chatsApi = new ChatsApi()