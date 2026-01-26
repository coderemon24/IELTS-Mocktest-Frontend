import { useAuthStore } from '../stores/admin-auth'

export default defineNuxtRouteMiddleware((to) => {
  const auth = useAuthStore()

  if (auth.loggedIn && to.path === '/admin/login') {
    return navigateTo('/admin')
  }

  if (!auth.loggedIn && to.path.startsWith('/admin') && to.path !== '/admin/login') {
    return navigateTo('/admin/login')
  }
})