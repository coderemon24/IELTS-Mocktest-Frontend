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
    async logout() {
      const { $axios } = useNuxtApp()
      
      try {
        await $axios.post('/admin/logout') 
      } catch (error) {
        console.error("Server logout failed", error)
      } finally {
        this.token = null
        this.loggedIn = false
        useCookie('auth_token').value = null
        navigateTo('/admin/login')
      }
    }
  }
})