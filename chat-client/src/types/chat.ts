import { Message } from "./message"
import { User } from "./user"

export interface Chat {
  id: number
  type: 'dm' | 'group'
  name: string
  members: ChatMember[]
  last_message: Message
  updated_at: string
  settings: GroupSettings
}

export interface GroupSettings {
  id: number
  name: string
  description: string
  avatar_url: string
}

export interface ChatMember {
  id: number
  role: 'admin' | 'member'
  user: User
}

export interface ChatSearchResult {
  type: 'dm' | 'group'
  id: number
  name: string
  avatar_url: string
}

