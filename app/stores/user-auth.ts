import { defineStore } from 'pinia'

type AuthUser = {
  name?: string
  email?: string
}

const cookieOptions = {
  path: '/',
  sameSite: 'lax' as const,
  maxAge: 60 * 60 * 24 * 30,
}

const readUserCookie = (): AuthUser | null => {
  const raw = useCookie<AuthUser | string | null>('user_profile', cookieOptions).value
  if (!raw) return null
  if (typeof raw === 'object') return raw as AuthUser
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as AuthUser
    } catch {
      return null
    }
  }
  return null
}

export const useUserAuthStore = defineStore('user-auth', {
  state: () => ({
    token: useCookie('user_auth_token', cookieOptions).value || null,
    user: readUserCookie(),
    loggedIn: !!useCookie('user_auth_token', cookieOptions).value,
  }),
  actions: {
    login(token: string, user?: AuthUser | null) {
      this.token = token
      this.loggedIn = true
      useCookie('user_auth_token', cookieOptions).value = token
      if (user) {
        this.user = user
        useCookie<AuthUser | null>('user_profile', cookieOptions).value = user
      }
    },
    setUser(user: AuthUser | null) {
      this.user = user
      useCookie<AuthUser | null>('user_profile', cookieOptions).value = user
    },
    async logout() {
      const { $axios } = useNuxtApp()

      try {
        await $axios.post('/logout')
      } catch (error) {
        console.error('Server logout failed', error)
      } finally {
        this.token = null
        this.loggedIn = false
        this.user = null
        useCookie('user_auth_token', cookieOptions).value = null
        useCookie('user_profile', cookieOptions).value = null
        navigateTo('/auth/login')
      }
    },
  },
})
