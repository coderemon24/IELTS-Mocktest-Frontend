import { defineStore } from 'pinia'

type AuthUser = {
  name?: string
  email?: string
}

const readUserCookie = (): AuthUser | null => {
  const raw = useCookie('user_profile').value
  if (!raw) return null
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export const useUserAuthStore = defineStore('user-auth', {
  state: () => ({
    token: useCookie('user_auth_token').value || null,
    user: readUserCookie(),
    loggedIn: !!useCookie('user_auth_token').value,
  }),
  actions: {
    login(token: string, user?: AuthUser | null) {
      this.token = token
      this.loggedIn = true
      useCookie('user_auth_token').value = token
      if (user) {
        this.user = user
        useCookie('user_profile').value = JSON.stringify(user)
      }
    },
    setUser(user: AuthUser | null) {
      this.user = user
      useCookie('user_profile').value = user ? JSON.stringify(user) : null
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
        useCookie('user_auth_token').value = null
        useCookie('user_profile').value = null
        navigateTo('/auth/login')
      }
    },
  },
})
