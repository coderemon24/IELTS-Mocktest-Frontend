<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useUserAuthStore } from '../stores/user-auth'

const isMockMenuOpen = ref(false)
const toggleMockMenu = () => {
  isMockMenuOpen.value = !isMockMenuOpen.value
}
const closeMockMenu = () => {
  isMockMenuOpen.value = false
}

const auth = useUserAuthStore()
const isLoggedIn = computed(() => auth.loggedIn)
const displayName = computed(() => auth.user?.name || 'Student')
const displayEmail = computed(() => auth.user?.email || '')
const avatarUrl = computed(() => {
  const name = encodeURIComponent(displayName.value || 'Student')
  return `https://ui-avatars.com/api/?name=${name}&background=0F172A&color=ffffff&size=128`
})

const logout = () => auth.logout()

const isProfileOpen = ref(false)
const toggleProfile = () => {
  isProfileOpen.value = !isProfileOpen.value
}
const closeProfile = () => {
  isProfileOpen.value = false
}

const route = useRoute()
const isActive = (path: string) => route.path === path
const menuClass = (path: string) =>
  isActive(path)
    ? 'bg-navy text-white'
    : 'text-slate-600 hover:bg-slate-50 hover:text-navy'

const hydrateUser = async () => {
  if (!process.client) return
  if (!auth.loggedIn || auth.user) return

  const config = useRuntimeConfig()
  const token = useCookie('user_auth_token', { path: '/' }).value
  if (!token) return

  try {
    const response = await $fetch('/me', {
      baseURL: config.public.apiBase,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })
    const user = (response as any)?.data
    if (user) auth.setUser(user)
  } catch {
    // ignore
  }
}

onMounted(hydrateUser)
</script>

<template>
  <nav class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
      <div class="container mx-auto px-4 h-20 flex items-center justify-between">
        
        <NuxtLink to="/" class="flex items-center gap-2 group">
          <div class="w-10 h-10 bg-navy rounded-xl text-white flex items-center justify-center font-bold text-xl group-hover:rotate-12 transition transform">I</div>
          <span class="text-2xl font-bold text-navy tracking-tight">IELTS<span class="text-orange">BD</span></span>
        </NuxtLink>

        <div class="hidden md:flex items-center gap-8">
          <NuxtLink to="/" class="text-sm font-semibold text-slate-600 hover:text-navy transition relative group">
            Home
            <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange transition-all group-hover:w-full"></span>
          </NuxtLink>
          <div class="relative group" @keydown.escape="closeMockMenu">
            <button
              type="button"
              class="text-sm font-semibold text-slate-600 hover:text-navy transition relative group"
              @click="toggleMockMenu"
            >
              Mock Tests
              <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange transition-all group-hover:w-full"></span>
            </button>
            <div
              :class="[
                'absolute left-0 top-full mt-2 w-48 rounded-xl bg-white border border-gray-100 shadow-xl py-2 opacity-0 pointer-events-none transition',
                'before:content-[\'\'] before:absolute before:-top-2 before:left-0 before:right-0 before:h-2',
                (isMockMenuOpen ? 'opacity-100 pointer-events-auto' : ''),
                'group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto',
              ]"
            >
              <NuxtLink
                to="/exam/listening"
                class="block px-4 py-2 text-sm text-slate-600 hover:text-navy hover:bg-slate-50 transition"
                @click="closeMockMenu"
              >
                Listening Test
              </NuxtLink>
              <NuxtLink
                to="/exam/writing"
                class="block px-4 py-2 text-sm text-slate-600 hover:text-navy hover:bg-slate-50 transition"
                @click="closeMockMenu"
              >
                Writing Test
              </NuxtLink>
              <NuxtLink
                to="/exam/speaking"
                class="block px-4 py-2 text-sm text-slate-600 hover:text-navy hover:bg-slate-50 transition"
                @click="closeMockMenu"
              >
                Speaking Test
              </NuxtLink>
              <NuxtLink
                to="/exam/reading"
                class="block px-4 py-2 text-sm text-slate-600 hover:text-navy hover:bg-slate-50 transition"
                @click="closeMockMenu"
              >
                Reading Test
              </NuxtLink>
            </div>
          </div>
          <NuxtLink to="/dashboard" class="text-sm font-semibold text-slate-600 hover:text-navy transition relative group">
            Dashboard
            <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange transition-all group-hover:w-full"></span>
          </NuxtLink>
        </div>

        <div class="flex items-center gap-4">
          
          <div v-if="isLoggedIn" class="relative">
            <button
              type="button"
              class="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-full border border-gray-200 hover:border-navy hover:shadow-md transition bg-white group"
              @click="toggleProfile"
              @keydown.escape="closeProfile"
            >
              <div class="text-right hidden sm:block">
                <p class="text-xs font-bold text-navy">{{ displayName }}</p>
                <p class="text-[10px] text-slate-400">Student</p>
              </div>
              <img :src="avatarUrl" class="w-9 h-9 rounded-full border-2 border-white shadow-sm group-hover:scale-105 transition" alt="Profile">
              <svg class="w-4 h-4 text-slate-400 group-hover:text-navy transition" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.17l3.71-3.94a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
              </svg>
            </button>

            <div
              :class="[
                'absolute right-0 mt-3 w-64 rounded-2xl bg-white border border-gray-100 shadow-xl p-3 z-50 transition',
                isProfileOpen ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none -translate-y-1',
              ]"
              @mouseleave="closeProfile"
            >
              <div class="flex items-center gap-3 px-2 py-2">
                <img :src="avatarUrl" class="w-10 h-10 rounded-full border border-white shadow-sm" alt="Profile">
                <div>
                  <p class="text-sm font-bold text-navy">{{ displayName }}</p>
                  <p class="text-xs text-slate-400">{{ displayEmail }}</p>
                </div>
              </div>

              <div class="mt-2 border-t border-gray-100 pt-2 space-y-1">
                <NuxtLink to="/dashboard" :class="['flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition', menuClass('/dashboard')]" @click="closeProfile">
                  <span class="w-2 h-2 rounded-full bg-blue-400"></span>
                  Dashboard
                </NuxtLink>
                <NuxtLink to="/my/subscriptions" :class="['flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition', menuClass('/my/subscriptions')]" @click="closeProfile">
                  <span class="w-2 h-2 rounded-full bg-mint"></span>
                  My Subscriptions
                </NuxtLink>
                <NuxtLink to="/my/orders" :class="['flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition', menuClass('/my/orders')]" @click="closeProfile">
                  <span class="w-2 h-2 rounded-full bg-orange"></span>
                  My Orders
                </NuxtLink>
                <NuxtLink to="/dashboard/profile" :class="['flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition', menuClass('/dashboard/profile')]" @click="closeProfile">
                  <span class="w-2 h-2 rounded-full bg-slate-300"></span>
                  Profile
                </NuxtLink>
                <button @click="logout" class="w-full text-left flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-rose-600 hover:bg-rose-50">
                  <span class="w-2 h-2 rounded-full bg-rose-400"></span>
                  Logout
                </button>
              </div>
            </div>
          </div>

          <NuxtLink v-else to="/login" class="group relative px-6 py-2.5 rounded-xl bg-navy text-white font-bold overflow-hidden shadow-lg shadow-navy/20 hover:shadow-navy/40 transition-all transform hover:-translate-y-0.5">
            <span class="relative z-10 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
              Login
            </span>
            <div class="absolute inset-0 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
          </NuxtLink>

        </div>
      </div>
    </nav>
</template>
