import { Chat } from '@/types/chat'
import { BaseApi } from './base'

interface GetDmResponse {
    chat: Chat
}

class ChatsApi extends BaseApi {
    constructor() {
        super('/api/chats')
    }

    getDmWithUser(recipientId: number) {
        return this.get<GetDmResponse>(`/dm-with-user/${recipientId}`, {
            auth: true,
        })
    }

    createDmWithUser(recipientId: number) {
        return this.post<GetDmResponse>(`/create-dm`, {
            recipientId,
        }, { auth: true })
    }
}

export const chatsApi = new ChatsApi()