import { Message } from "./message"
import { User } from "./user"

export interface Chat {
  id: number
  type: 'dm' | 'group'
  name: string
  members: User[]
  last_message: Message
  updated_at: string
}

export interface ChatSearchResult {
  type: 'dm' | 'group'
  id: number
  name: string
}

