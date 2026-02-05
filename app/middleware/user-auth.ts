import { useUserAuthStore } from '../stores/user-auth'

export default defineNuxtRouteMiddleware((to) => {
  const auth = useUserAuthStore()

  if (!auth.loggedIn) {
    const redirect = encodeURIComponent(to.fullPath || '/')
    return navigateTo(`/login?redirect=${redirect}`)
  }
})
