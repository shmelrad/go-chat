import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '@/stores/authStore'
import useWebSocket from 'react-use-websocket'
import MessageView from './MessageView'
import TextEditor from './TextEditor'
import ChatLayout from './ChatLayout'
import { Navigate, useParams, useSearchParams } from 'react-router-dom'
import { messagesApi, MessagesResponse } from '@/lib/api/messages'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { chatsApi } from '@/lib/api/chats'
import { ApiError } from '@/lib/api/base'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Chat, ChatMember } from '@/types/chat'
import { ChatSettingsModal } from './ChatSettingsModal'
import Spinner from '@/components/ui/spinner'

export default function ChatPage() {
  const { chatId } = useParams()
  const [searchParams] = useSearchParams()
  const type = searchParams.get('type')
  const name = searchParams.get('name')
  const avatarUrl = searchParams.get('avatarUrl')
  const isChatId = searchParams.get('isChatId') === 'true'

  if (!chatId) {
    return (
      <ChatLayout header={<SidebarTrigger />}>
        <div className="flex items-center justify-center h-full bg-gradient-to-br from-sky-400 to-sky-500">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold">Welcome to go-chat</h2>
            <p className="mt-2">Select a chat from the sidebar to start messaging</p>
          </div>
        </div>
      </ChatLayout>
    )
  }

  if (!type || !name) {
    return <Navigate to="/chat" />
  }

  if (type === 'dm') {
    if (isChatId) {
      return <ChatView type="dm" name={name} chatId={parseInt(chatId)} avatarUrl={avatarUrl ?? ""} />
    }
    return <ChatView type="dm" name={name} recipientId={parseInt(chatId)} avatarUrl={avatarUrl ?? ""} />
  }

  return <ChatView type="group" name={name} chatId={parseInt(chatId)} avatarUrl={avatarUrl ?? ""} />
}

function ChatView({ name, recipientId, chatId, avatarUrl, type }: { 
  name: string, 
  recipientId?: number, 
  chatId?: number, 
  avatarUrl: string,
  type: 'dm' | 'group'
}) {
  const { token, user } = useAuthStore((state) => state)
  const [recipient, setRecipient] = useState<ChatMember | null>(null)
  const queryClient = useQueryClient()
  const [isSending, setIsSending] = useState(false)

  const { data: chat } = useQuery({
    queryKey: ['chat', recipientId, chatId],
    queryFn: async () => {
      try {
        if (chatId) {
          return (await chatsApi.getChat(chatId)).chat
        } else if (recipientId && type === 'dm') {
          return (await chatsApi.getDmWithUser(recipientId)).chat
        }
        throw new Error('No chat ID or recipient ID provided')
      } catch (error: unknown) {
        if ((error as ApiError).code === 404) {
          if (recipientId && type === 'dm') {
            const newChat = (await chatsApi.createDmWithUser(recipientId)).chat
            queryClient.invalidateQueries({ queryKey: ['user-chats'] })
            return newChat
          }
          throw new Error('Chat not found')
        }
        throw error
      }
    }
  })

  useEffect(() => {
    if (chat?.members && type === 'dm') {
      setRecipient(chat.members.find(member => member.id !== user?.id)!)
    }
  }, [chat, user, type])

  const { data: messagesData } = useQuery({
    queryKey: ['messages', chat?.id],
    queryFn: () => messagesApi.getMessages(chat?.id),
    enabled: !!chat?.id
  })

  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const { sendMessage: sendWebSocketMessage } = useWebSocket(
    `ws://localhost:8080/ws?access_token=${token}`,
    {
      onMessage: (event) => {
        try {
          const message = JSON.parse(event.data)
          switch (message.action) {
            case 'new_message':
              setIsSending(false)
              queryClient.setQueryData(['messages', chat?.id], (old: MessagesResponse | undefined) => ({
                messages: [...(old?.messages || []), message.data.message]
              }))

              queryClient.setQueryData(['user-chats'], (old: { chats: Chat[] } | undefined) => {
                if (!old) return { chats: [] }
                return {
                  chats: old.chats.map(c => {
                    if (c.id === chat?.id) {
                      return {
                        ...c,
                        last_message: message.data.message
                      }
                    }
                    return c
                  })
                }
              })
              break;
            case 'send_message_error':
              setIsSending(false)
              toast.error(`Failed to send message: ${message.data.error}`)
              break;
          }
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
          setIsSending(false)
        }
      }
    }
  )

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messagesData?.messages])

  if (!chat) {
    return (
      <div className="flex items-center justify-center h-full bg-gradient-to-br from-sky-400 to-sky-500">
        <Spinner />
      </div>
    )
  }
  return (
    <ChatLayout header={<ChatHeader name={name} avatarUrl={avatarUrl} chat={chat} isGroup={type === 'group'} />}>
      <div className="flex flex-col h-full">
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-4 bg-gradient-to-br from-sky-400 to-sky-500 scroll-smooth"
        >
          <div className="flex flex-col gap-2">
            {messagesData?.messages.map((msg) => {
              const messageUser = type === 'dm' 
                ? (msg.user_id === user?.id ? user : recipient?.user)
                : chat?.members.find(member => member.user.id === msg.user_id)?.user

              if (!messageUser) {
                console.error('Message user not found')
                return null
              }
              
              return (
                <MessageView
                  key={msg.id}
                  message={msg}
                  isCurrentUser={msg.user_id === user?.id}
                  side={msg.user_id === user?.id ? 'right' : 'left'}
                  user={messageUser}
                />
              )
            })}
          </div>
        </div>
        <TextEditor
          sendWebSocketMessage={(msg) => {
            setIsSending(true)
            sendWebSocketMessage(msg)
          }}
          chat={chat}
          isSending={isSending}
        />
      </div>
    </ChatLayout>
  )
}

const ChatHeader = ({ name, avatarUrl, chat, isGroup }: { name: string, avatarUrl: string, chat: Chat, isGroup: boolean }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  return (
    <div className="flex items-center py-1">
      <SidebarTrigger />
      <div 
        className={`flex-1 flex justify-center ${isGroup ? 'cursor-pointer' : ''}`} 
        onClick={() => isGroup && setIsSettingsOpen(true)}
      >
        <Avatar>
          <AvatarImage src={avatarUrl} />
          <AvatarFallback>{name[0]}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col ml-2">
          <p className="text-lg leading-none">{name}</p>
          <p className="text-sm text-muted-foreground">Online</p>
        </div>
      </div>
      {chat.type === 'group' && (
        <ChatSettingsModal 
          open={isSettingsOpen}
          onOpenChange={setIsSettingsOpen}
          chat={chat}
        />
      )}
    </div>
  )
}