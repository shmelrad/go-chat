import { create } from 'zustand'
import { jwtDecode } from "jwt-decode";
import { User } from '@/types/user';

interface AuthState {
  token: string | null
  user: User | null
  login: (token: string) => void
  logout: () => void
  updateUser: (user: User) => void
}

interface DecodedUser {
  sub: string;
  username: string;
  email: string;
  avatar_url: string;
}

const decodeUser = (token: string) => {
  const userInfo = jwtDecode<DecodedUser>(token)
  return {
    id: parseInt(userInfo.sub),
    username: userInfo.username,
    email: userInfo.email,
    avatar_url: userInfo.avatar_url
  }
}

export const useAuthStore = create<AuthState>((set) => {
  const token = localStorage.getItem('token')
  const user = token ? decodeUser(token) : null

  return {
    token,
    user,
    login: (token) => {
      localStorage.setItem('token', token)
      const user = decodeUser(token)
      set({ token, user })
    },
    updateUser: (user) => {
      set({ user })
    },
    logout: () => {
      localStorage.removeItem('token')
      set({ token: null, user: null })
    }
  }
})

