import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { User, LoginRequest, RegisterRequest } from '@/types/auth'
import { authApi } from '@/api/authApi'
import { toast } from 'sonner'

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  isLoading: boolean

  login: (credentials: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  setTokens: (accessToken: string, refreshToken: string) => void
  setUser: (user: User) => void
  clearAuth: () => void
  initializeAuth: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (credentials) => {
        set({ isLoading: true })
        try {
          const data = await authApi.login(credentials)
          sessionStorage.setItem('accessToken', data.accessToken)
          sessionStorage.setItem('refreshToken', data.refreshToken)
          set({
            user: data.user,
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
            isAuthenticated: true,
          })
        } catch (error) {
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      register: async (data) => {
        set({ isLoading: true })
        try {
          const response = await authApi.register(data)
          sessionStorage.setItem('accessToken', response.accessToken)
          sessionStorage.setItem('refreshToken', response.refreshToken)
          set({
            user: response.user,
            accessToken: response.accessToken,
            refreshToken: response.refreshToken,
            isAuthenticated: true,
          })
        } catch (error) {
          throw error
        } finally {
          set({ isLoading: false })
        }
      },

      logout: async () => {
        const { refreshToken } = get()
        try {
          await authApi.logout(refreshToken ?? undefined)
        } catch {
          // Ignore errors — always clear local state
        } finally {
          sessionStorage.removeItem('accessToken')
          sessionStorage.removeItem('refreshToken')
          set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false })
        }
      },

      setTokens: (accessToken, refreshToken) => {
        sessionStorage.setItem('accessToken', accessToken)
        sessionStorage.setItem('refreshToken', refreshToken)
        set({ accessToken, refreshToken, isAuthenticated: true })
      },

      setUser: (user) => set({ user }),

      clearAuth: () => {
        sessionStorage.removeItem('accessToken')
        sessionStorage.removeItem('refreshToken')
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false })
      },

      // Called on app startup — try to refresh if we have a stored refresh token
      initializeAuth: async () => {
        const storedRefresh = sessionStorage.getItem('refreshToken')
        if (!storedRefresh) return

        set({ isLoading: true })
        try {
          const data = await authApi.refreshToken(storedRefresh)
          sessionStorage.setItem('accessToken', data.accessToken)
          sessionStorage.setItem('refreshToken', data.refreshToken)
          set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken, isAuthenticated: true })
        } catch {
          sessionStorage.removeItem('refreshToken')
          set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false })
        } finally {
          set({ isLoading: false })
        }
      },
    }),
    {
      name: 'aimarket-auth',
      storage: createJSONStorage(() => sessionStorage),
      // Only persist user and auth status; tokens handled separately
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
