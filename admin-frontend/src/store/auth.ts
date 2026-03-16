import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type UserRole = 'teacher' | 'principal' | 'head_principal' | 'admin'

export interface UserInfo {
  userId: number
  token: string
  nickname: string
  avatar: string
  role: UserRole
  institutionId?: number
  campusId?: number
}

interface AuthState {
  token: string | null
  userInfo: UserInfo | null
  setAuth: (userInfo: UserInfo) => void
  clearAuth: () => void
  isLoggedIn: () => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      userInfo: null,

      setAuth: (userInfo: UserInfo) => {
        set({ token: userInfo.token, userInfo })
      },

      clearAuth: () => {
        set({ token: null, userInfo: null })
      },

      isLoggedIn: () => {
        return !!get().token
      },
    }),
    {
      name: 'english-admin-auth',
      // 只持久化 token 和 userInfo
      partialize: (state) => ({ token: state.token, userInfo: state.userInfo }),
    },
  ),
)
