import { create } from 'zustand'
import { jwtDecode } from "jwt-decode";
import { User } from '@/types/user';

interface AuthState {
  token: string | null
  user: User | null
  login: (token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => {
  const token = localStorage.getItem('token')
  const userInfo = token ? jwtDecode<User>(token) : null
  return {
    token,
    login: (token) => {
      localStorage.setItem('token', token)
      set({ token })
    },
    user: userInfo,
    logout: () => {
      localStorage.removeItem('token')
      set({ token: null })
    }
  }
})