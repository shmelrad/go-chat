import { Chat, ChatMember } from '@/types/chat'
import { BaseApi } from './base'

interface GetChatResponse {
    chat: Chat
}

interface CreateGroupChatRequest {
    name: string
}

interface UploadAvatarResponse {
    avatar_url: string
}

interface AddParticipantResponse {
    member: ChatMember
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

    uploadAvatar(chatId: number, formData: FormData) {
        return this.postFile<UploadAvatarResponse>(`/${chatId}/upload-avatar`, formData, {
            auth: true,
        })
    }

    addParticipant(chatId: number, username: string) {
        return this.post<AddParticipantResponse>(`/${chatId}/add-participant`, {
            username
        }, { auth: true })
    }

    removeParticipant(chatId: number, userId: number) {
        return this.post<void>(`/${chatId}/remove-participant/${userId}`, {}, {
            auth: true,
        })
    }
}

export const chatsApi = new ChatsApi()