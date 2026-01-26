<script setup lang="ts">
import { ref } from 'vue'

const isSidebarOpen = ref(true)
const isDark = ref(false)
const isFullScreen = ref(false)
const showProfileMenu = ref(false)
const showNotifications = ref(false)
const activeSubMenu = ref<string | null>(null)

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
</script>

<template>
  <div :class="[isDark ? 'dark' : '', 'min-h-screen font-sans transition-colors duration-300']">
    <div class="flex h-screen bg-offwhite dark:bg-slate-900 overflow-hidden">
      
      <AdminSidebar 
        :isOpen="isSidebarOpen" 
        :activeSubMenu="activeSubMenu"
        @toggleSubMenu="(name) => activeSubMenu = activeSubMenu === name ? null : name"
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