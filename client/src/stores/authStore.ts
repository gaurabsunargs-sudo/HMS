import Cookies from 'js-cookie'
import { create } from 'zustand'
import { decryptData } from '@/lib/encryptionUtils'

const ACCESS_TOKEN = 'hms-token'

interface AuthUser {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  role: string
  profile?: string
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  accessToken: string
  setUser: (user: AuthUser | null) => void
  setAccessToken: (accessToken: string) => void
  resetAccessToken: () => void
  reset: () => void
  checkAuth: () => void
}

export const useAuthStore = create<AuthState>()((set) => {
  const checkAuth = () => {
    const token = Cookies.get(ACCESS_TOKEN)
    if (token) {
      try {
        const decryptedToken = decryptData(token) as string
        set({
          accessToken: decryptedToken,
          isAuthenticated: true,
        })
      } catch (error) {
        console.error('Token decryption failed:', error)
        Cookies.remove(ACCESS_TOKEN)
        set({
          accessToken: '',
          isAuthenticated: false,
          user: null,
        })
      }
    } else {
      set({
        accessToken: '',
        isAuthenticated: false,
        user: null,
      })
    }
  }

  return {
    user: null,
    isAuthenticated: false,
    accessToken: '',
    setUser: (user) =>
      set({
        user,
        isAuthenticated: !!user,
      }),
    setAccessToken: (accessToken) =>
      set({
        accessToken,
        isAuthenticated: !!accessToken,
      }),
    resetAccessToken: () => {
      Cookies.remove(ACCESS_TOKEN)
      set({
        accessToken: '',
        isAuthenticated: false,
        user: null,
      })
    },
    reset: () => {
      Cookies.remove(ACCESS_TOKEN)
      set({
        user: null,
        accessToken: '',
        isAuthenticated: false,
      })
    },
    checkAuth,
  }
})

// Initialize auth state after store creation
useAuthStore.getState().checkAuth()

// export const useAuth = () => useAuthStore((state) => state.auth)
