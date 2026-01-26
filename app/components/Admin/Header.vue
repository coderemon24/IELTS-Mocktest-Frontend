<script setup lang="ts">
const props = defineProps(['isDark', 'isFullScreen', 'showNotifications', 'showProfileMenu'])
const emit = defineEmits(['toggleSidebar', 'toggleTheme', 'toggleFullScreen', 'toggleNotifications', 'toggleProfileMenu'])
</script>

<template>
  <header class="h-20 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6 sticky top-0 z-10 transition-colors">
    <button @click.stop="emit('toggleSidebar')" class="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 text-navy dark:text-slate-200 transition">
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h7"></path></svg>
    </button>

    <div class="flex items-center gap-4">
      <button @click="emit('toggleFullScreen')" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-slate-500 transition hidden sm:block">
        <svg v-if="!isFullScreen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"></path></svg>
        <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>
      </button>

      <button @click="emit('toggleTheme')" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-slate-500 transition">
        <svg v-if="!isDark" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>
        <svg v-else class="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
      </button>

      <div class="relative">
        <button @click.stop="emit('toggleNotifications')" class="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700 text-slate-500 transition relative">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
          <span class="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-orange rounded-full border-2 border-white dark:border-slate-800 animate-pulse"></span>
        </button>
        <div v-if="showNotifications" class="absolute right-0 mt-4 w-80 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden z-50">
           <div class="p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
             <h3 class="font-bold text-navy dark:text-white">Notifications</h3>
             <span class="text-xs text-mint cursor-pointer">Mark all read</span>
           </div>
           <div class="p-4 text-sm text-slate-500">No new notifications.</div>
        </div>
      </div>

      <div class="relative pl-4 border-l border-gray-200 dark:border-slate-700">
        <button @click.stop="emit('toggleProfileMenu')" class="flex items-center gap-3 hover:opacity-80 transition">
          <div class="text-right hidden md:block">
            <p class="text-sm font-bold text-navy dark:text-white leading-none">Admin User</p>
            <p class="text-xs text-slate-500 mt-1">Super Admin</p>
          </div>
          <img src="https://ui-avatars.com/api/?name=Admin+User&background=0D9488&color=fff" class="w-10 h-10 rounded-full border-2 border-white shadow-sm">
        </button>
        <div v-if="showProfileMenu" class="absolute right-0 mt-4 w-56 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-gray-100 dark:border-slate-700 overflow-hidden z-50">
           <div class="p-2 space-y-1">
             <a href="#" class="flex items-center gap-2 px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-lg">My Profile</a>
             <div class="h-px bg-gray-100 dark:bg-slate-700 my-1"></div>
             <a href="#" class="flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg">Logout</a>
           </div>
        </div>
      </div>
    </div>
  </header>
</template>