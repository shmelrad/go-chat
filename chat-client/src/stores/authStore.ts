import { create } from 'zustand'
import { jwtDecode } from "jwt-decode";
import { User } from '@/types/user';

interface AuthState {
  token: string | null
  user: User | null
  login: (token: string) => void
  logout: () => void
}

interface DecodedUser {
  sub: string;
  username: string;
  email: string;
}

const decodeUser = (token: string) => {
  const userInfo = jwtDecode<DecodedUser>(token)
  return {
    id: parseInt(userInfo.sub),
    username: userInfo.username,
    email: userInfo.email
  }
}

export const useAuthStore = create<AuthState>((set) => {
  const token = localStorage.getItem('token')
  const user = token ? decodeUser(token) : null

  return {
    token,
    login: (token) => {
      localStorage.setItem('token', token)
      const user = decodeUser(token)
      set({ token, user })
    },
    user,
    logout: () => {
      localStorage.removeItem('token')
      set({ token: null, user: null })
    }
  }
})

