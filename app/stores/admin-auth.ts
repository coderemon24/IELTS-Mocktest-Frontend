import { defineStore } from 'pinia'

export const useAuthStore = defineStore('admin-auth', {
  state: () => ({
    token: useCookie('auth_token').value || null,
    loggedIn: !!useCookie('auth_token').value,
  }),
  actions: {
    login(token: string) {
      this.token = token
      this.loggedIn = true
      useCookie('auth_token').value = token
    },
    logout() {
      this.token = null
      this.loggedIn = false
      useCookie('auth_token').value = null
      return navigateTo('/admin/login')
    }
  }
})