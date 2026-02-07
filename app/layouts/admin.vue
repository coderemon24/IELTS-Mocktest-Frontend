<script setup lang="ts">
import { ref, watch } from 'vue'

const isSidebarOpen = ref(true)
const isDark = ref(false)
const isFullScreen = ref(false)
const showProfileMenu = ref(false)
const showNotifications = ref(false)
const activeSubMenu = ref<string | null>(null)
const activeNestedSubMenu = ref<string | null>(null)
const route = useRoute()

const toggleTheme = () => {
  isDark.value = !isDark.value
  document.documentElement.classList.toggle('dark', isDark.value)
}

const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullScreen.value = true
  } else {
    document.exitFullscreen()
    isFullScreen.value = false
  }
}

const closeDropdowns = () => {
  showProfileMenu.value = false
  showNotifications.value = false
}

const toggleSubMenu = (name: string) => {
  const isClosing = activeSubMenu.value === name
  activeSubMenu.value = isClosing ? null : name
  activeNestedSubMenu.value = null
}

const toggleNestedSubMenu = (name: string) => {
  activeNestedSubMenu.value = activeNestedSubMenu.value === name ? null : name
}

const syncActiveMenu = (path: string) => {
  if (path.startsWith('/admin/exams')) {
    activeSubMenu.value = 'Exams'
    activeNestedSubMenu.value = path.startsWith('/admin/exams/listening')
      ? 'Exams::Listening'
      : null
    return
  }

  if (path.startsWith('/admin/packages')) {
    activeSubMenu.value = 'Packages'
    activeNestedSubMenu.value = null
    return
  }

  if (
    path.startsWith('/admin/orders') ||
    path.startsWith('/admin/payments') ||
    path.startsWith('/admin/subscriptions')
  ) {
    activeSubMenu.value = 'Commerce'
    activeNestedSubMenu.value = null
    return
  }

  if (path.startsWith('/admin/users')) {
    activeSubMenu.value = 'Users'
    activeNestedSubMenu.value = null
    return
  }

  activeSubMenu.value = null
  activeNestedSubMenu.value = null
}

watch(
  () => route.path,
  (path) => syncActiveMenu(path),
  { immediate: true },
)
</script>

<template>
  <div :class="[isDark ? 'dark' : '', 'min-h-screen font-sans transition-colors duration-300']">
    <div class="flex h-screen bg-offwhite dark:bg-slate-900 overflow-hidden">
      
      <AdminSidebar 
        :isOpen="isSidebarOpen" 
        :activeSubMenu="activeSubMenu"
        :activeNestedSubMenu="activeNestedSubMenu"
        @toggleSubMenu="toggleSubMenu"
        @toggleNestedSubMenu="toggleNestedSubMenu"
      />

      <div class="flex-1 flex flex-col min-w-0" @click="closeDropdowns">
        
        <AdminHeader 
          :isDark="isDark"
          :isFullScreen="isFullScreen"
          :showNotifications="showNotifications"
          :showProfileMenu="showProfileMenu"
          @toggleSidebar="isSidebarOpen = !isSidebarOpen"
          @toggleTheme="toggleTheme"
          @toggleFullScreen="toggleFullScreen"
          @toggleNotifications="showNotifications = !showNotifications"
          @toggleProfileMenu="showProfileMenu = !showProfileMenu"
        />

        <main class="flex-1 overflow-x-hidden overflow-y-auto bg-offwhite dark:bg-slate-900 p-6 relative">
          <div class="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-slate-800/50 pointer-events-none"></div>
          <div class="relative z-0">
            <slot />
          </div>
        </main>

        <AdminFooter />

      </div>
    </div>
  </div>
</template>
