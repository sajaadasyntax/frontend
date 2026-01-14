import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  phone: string
  name?: string
  email?: string
  role: 'USER' | 'ADMIN'
  loyaltyPoints: number
  country?: string
  state?: string
  address?: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
  getToken: () => string | null
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        set({ user, token, isAuthenticated: true })
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },

      getToken: () => get().token,
    }),
    {
      name: 'auth-storage',
    }
  )
)

