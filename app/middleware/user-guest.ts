import { useUserAuthStore } from '../stores/user-auth'

export default defineNuxtRouteMiddleware(() => {
  const auth = useUserAuthStore()

  if (auth.loggedIn) {
    return navigateTo('/')
  }
})
