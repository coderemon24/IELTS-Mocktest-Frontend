<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'

// --- State Management ---
const isSidebarOpen = ref(true)
const isDark = ref(false)
const isFullScreen = ref(false)
const showProfileMenu = ref(false)
const showNotifications = ref(false)
const activeSubMenu = ref<string | null>(null)

// --- Menu Configuration ---
const menuItems = [
  { name: 'Dashboard', icon: 'home', route: '/admin/dashboard' },
  { name: 'Exams', icon: 'document-text', route: '/admin/exams' },
  { name: 'Students', icon: 'users', route: '/admin/students' },
  { name: 'Results', icon: 'chart-bar', route: '/admin/results' },
  { 
    name: 'Users', 
    icon: 'user-group', 
    subMenus: [
      { name: 'All Users', route: '/admin/users' },
      { name: 'Roles', route: '/admin/users/roles' }
    ]
  },
  { name: 'Settings', icon: 'cog', route: '/admin/settings' },
]

// --- Actions ---
const toggleSidebar = () => isSidebarOpen.value = !isSidebarOpen.value

const toggleTheme = () => {
  isDark.value = !isDark.value
  if (isDark.value) {
    document.documentElement.classList.add('dark')
  } else {
    document.documentElement.classList.remove('dark')
  }
}

const toggleFullScreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullScreen.value = true
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
      isFullScreen.value = false
    }
  }
}

const toggleSubMenu = (name: string) => {
  if (activeSubMenu.value === name) {
    activeSubMenu.value = null
  } else {
    activeSubMenu.value = name
  }
}

// Close dropdowns when clicking outside (Mock logic)
const closeDropdowns = () => {
  showProfileMenu.value = false
  showNotifications.value = false
}
</script>

<template>
  <div :class="[isDark ? 'dark' : '', 'min-h-screen font-sans transition-colors duration-300']">
    <div class="flex h-screen bg-offwhite dark:bg-slate-900 overflow-hidden">

      <aside 
        :class="[
          'bg-navy dark:bg-slate-800 text-white flex flex-col transition-all duration-300 shadow-xl z-20 relative',
          isSidebarOpen ? 'w-64' : 'w-20'
        ]"
      >
        <div class="h-20 flex items-center justify-center border-b border-white/10 relative overflow-hidden">
          <div v-if="isSidebarOpen" class="flex items-center gap-2">
            <div class="w-8 h-8 bg-mint rounded-lg flex items-center justify-center text-navy font-bold text-xl">I</div>
            <span class="text-2xl font-bold tracking-tight">IELTS<span class="text-mint">BD</span></span>
          </div>
          <div v-else class="text-2xl font-bold text-mint">I</div>
          
          <div class="absolute -top-10 -left-10 w-24 h-24 bg-mint/20 rounded-full blur-2xl"></div>
        </div>

        <div class="flex-1 overflow-y-auto py-6 space-y-2 custom-scrollbar">
          <template v-for="(item, index) in menuItems" :key="index">
            
            <div v-if="!item.subMenus">
              <NuxtLink 
                :to="item.route" 
                class="relative flex items-center px-6 py-3 text-slate-300 hover:text-white hover:bg-white/10 transition-colors group"
                active-class="bg-white/10 text-mint border-r-4 border-mint"
              >
                <component :is="getIcon(item.icon)" class="w-6 h-6 shrink-0 transition-transform group-hover:scale-110" />
                <span v-if="isSidebarOpen" class="ml-3 font-medium">{{ item.name }}</span>
                
                <div v-if="!isSidebarOpen" class="absolute left-16 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition z-50 whitespace-nowrap">
                  {{ item.name }}
                </div>
              </NuxtLink>
            </div>

            <div v-else>
              <button 
                @click="toggleSubMenu(item.name)"
                class="w-full relative flex items-center justify-between px-6 py-3 text-slate-300 hover:text-white hover:bg-white/10 transition-colors group"
              >
                <div class="flex items-center">
                  <component :is="getIcon(item.icon)" class="w-6 h-6 shrink-0" />
                  <span v-if="isSidebarOpen" class="ml-3 font-medium">{{ item.name }}</span>
                </div>
                <svg v-if="isSidebarOpen" :class="['w-4 h-4 transition-transform', activeSubMenu === item.name ? 'rotate-180' : '']" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
              </button>

              <div v-if="isSidebarOpen && activeSubMenu === item.name" class="bg-navy-dark dark:bg-slate-900/50 py-2">
                <NuxtLink 
                  v-for="sub in item.subMenus" 
                  :key="sub.name"
                  :to="sub.route"
                  class="flex items-center pl-14 pr-6 py-2 text-sm text-slate-400 hover:text-mint hover:bg-white/5 transition"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-current mr-2"></span>
                  {{ sub.name }}
                </NuxtLink>
              </div>
            </div>
          </template>
        </div>

        <div class="p-4 border-t border-white/10 text-xs text-center text-slate-400">
          <p v-if="isSidebarOpen">v2.0.1 Admin</p>
        </div>
      </aside>

      <div class="flex-1 flex flex-col min-w-0" @click="closeDropdowns">
        
        <header class="h-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 sticky top-0 z-10 transition-colors">
          
          <button @click.stop="toggleSidebar" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-navy dark:text-slate-200 transition">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
          </button>

          <div class="flex items-center gap-4">
            
            <button @click="toggleFullScreen" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-slate-500 transition hidden sm:block">
              <svg v-if="!isFullScreen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
            </button>

            <button @click="toggleTheme" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-slate-500 transition">
              <svg v-if="!isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
              <svg v-else class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
            </button>

            <div class="relative">
              <button @click.stop="showNotifications = !showNotifications" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-slate-500 transition relative">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                <span class="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-orange rounded-full border-2 border-white dark:border-slate-800 animate-pulse"></span>
              </button>
              
              <div v-if="showNotifications" class="absolute right-0 mt-4 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden z-50 origin-top-right transition-all">
                <div class="p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
                  <h3 class="font-bold text-navy dark:text-white">Notifications</h3>
                  <span class="text-xs text-mint cursor-pointer">Mark all read</span>
                </div>
                <div class="max-h-64 overflow-y-auto">
                  <div class="p-4 hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer border-b border-gray-50 dark:border-slate-700 last:border-0 transition">
                    <p class="text-sm font-semibold text-slate-700 dark:text-slate-200">New Exam Published</p>
                    <p class="text-xs text-slate-500 mt-1">IELTS Mock Test #42 is now live.</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="relative pl-4 border-l border-gray-200 dark:border-slate-700">
              <button @click.stop="showProfileMenu = !showProfileMenu" class="flex items-center gap-3 hover:opacity-80 transition">
                <div class="text-right hidden md:block">
                  <p class="text-sm font-bold text-navy dark:text-white leading-none">Admin User</p>
                  <p class="text-xs text-slate-500 mt-1">Super Admin</p>
                </div>
                <img src="https://ui-avatars.com/api/?name=Admin+User&background=0D9488&color=fff" alt="Profile" class="w-10 h-10 rounded-full border-2 border-white shadow-sm">
              </button>

              <div v-if="showProfileMenu" class="absolute right-0 mt-4 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden z-50 origin-top-right transition-all">
                <div class="p-2 space-y-1">
                  <a href="#" class="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-navy dark:hover:text-white rounded-lg transition">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
                    My Profile
                  </a>
                  <a href="#" class="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 hover:text-navy dark:hover:text-white rounded-lg transition">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
                    Change Password
                  </a>
                  <div class="h-px bg-gray-100 dark:bg-slate-700 my-1"></div>
                  <a href="#" class="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    Logout
                  </a>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main class="flex-1 overflow-x-hidden overflow-y-auto bg-offwhite dark:bg-slate-900 p-6 relative">
          <div class="absolute top-0 left-0 w-full h-48 bg-gradient-to-b from-blue-50/50 to-transparent dark:from-slate-800/50 pointer-events-none"></div>
           
           <div class="relative z-0">
             <slot />
           </div>
        </main>

        <footer class="bg-white dark:bg-slate-800 border-t border-gray-200 dark:border-slate-700 p-4 text-center">
          <p class="text-sm text-slate-500 dark:text-slate-400">
            &copy; {{ new Date().getFullYear() }} <span class="font-bold text-navy dark:text-white">Kaien IT Ltd</span>. All rights reserved.
          </p>
        </footer>

      </div>
    </div>
  </div>
</template>

<script lang="ts">
// Helper to render icons (Simple SVG components)
import { h } from 'vue'

const Icons = {
  home: { render: () => h('svg', { fill:'none', viewBox:'0 0 24 24', stroke:'currentColor', 'stroke-width':2 }, [h('path', { 'stroke-linecap':'round', 'stroke-linejoin':'round', d:'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' })]) },
  'document-text': { render: () => h('svg', { fill:'none', viewBox:'0 0 24 24', stroke:'currentColor', 'stroke-width':2 }, [h('path', { 'stroke-linecap':'round', 'stroke-linejoin':'round', d:'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 011.414.586l5.414 5.414a1 1 0 01.586 1.414V19a2 2 0 01-2 2z' })]) },
  users: { render: () => h('svg', { fill:'none', viewBox:'0 0 24 24', stroke:'currentColor', 'stroke-width':2 }, [h('path', { 'stroke-linecap':'round', 'stroke-linejoin':'round', d:'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' })]) },
  'chart-bar': { render: () => h('svg', { fill:'none', viewBox:'0 0 24 24', stroke:'currentColor', 'stroke-width':2 }, [h('path', { 'stroke-linecap':'round', 'stroke-linejoin':'round', d:'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' })]) },
  'user-group': { render: () => h('svg', { fill:'none', viewBox:'0 0 24 24', stroke:'currentColor', 'stroke-width':2 }, [h('path', { 'stroke-linecap':'round', 'stroke-linejoin':'round', d:'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' })]) },
  cog: { render: () => h('svg', { fill:'none', viewBox:'0 0 24 24', stroke:'currentColor', 'stroke-width':2 }, [h('path', { 'stroke-linecap':'round', 'stroke-linejoin':'round', d:'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' }), h('path', { 'stroke-linecap':'round', 'stroke-linejoin':'round', d:'M15 12a3 3 0 11-6 0 3 3 0 016 0z' })]) },
}

const getIcon = (name: string) => Icons[name as keyof typeof Icons] || Icons.home
</script>

<style scoped>
/* Custom Scrollbar for Sidebar */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.4);
}
</style>