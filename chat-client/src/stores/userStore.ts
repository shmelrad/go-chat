import { create } from 'zustand'

interface AuthState {
  token: string | null
  login: (token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>((set) => {
  const token = localStorage.getItem('token')
  
  return {
    token,
    login: (token) => {
      localStorage.setItem('token', token)
      set({ token })
    },
    logout: () => {
      localStorage.removeItem('token')
      set({ token: null })
    }
  }
})