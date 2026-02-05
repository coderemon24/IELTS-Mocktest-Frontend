import type { FetchOptions } from 'ofetch'
import { useUserAuthStore } from '../stores/user-auth'

export default defineNuxtPlugin(async () => {
  const auth = useUserAuthStore()
  const config = useRuntimeConfig()
  const token = useCookie('user_auth_token', { path: '/' }).value

  if (!process.client) return

  if (token && auth.loggedIn && !auth.user) {
    try {
      const options: FetchOptions = {
        baseURL: config.public.apiBase,
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
      }

      const response = await $fetch('/me', options)
      const user = (response as any)?.data
      if (user) auth.setUser(user)
    } catch (error) {
      // Silently ignore and let user re-login if needed
    }
  }
})
