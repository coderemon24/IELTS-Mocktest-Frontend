<script setup lang="ts">
import gsap from 'gsap'

onMounted(() => {
  gsap.from('.password-card', { y: 20, opacity: 0, duration: 0.6, ease: 'power2.out' })
})

// State for inputs
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')

// State for visibility toggles
const showCurrent = ref(false)
const showNew = ref(false)
const showConfirm = ref(false)

const updatePassword = () => {
  if (newPassword.value !== confirmPassword.value) {
    alert("New passwords do not match!")
    return
  }
  // API Call logic here
  alert("Password updated successfully")
}
</script>

<template>
  <div class="min-h-screen bg-offwhite p-6 md:p-8">
    <div class="max-w-2xl mx-auto">
      
      <h2 class="text-2xl font-bold text-navy mb-6">Security Settings</h2>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 password-card">
        <div class="flex items-center gap-4 mb-8">
          <div class="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-red-500">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
          </div>
          <div>
            <h3 class="text-lg font-bold text-navy">Change Password</h3>
            <p class="text-sm text-slate-500">Ensure your account is using a long, random password to stay secure.</p>
          </div>
        </div>

        <form @submit.prevent="updatePassword" class="space-y-6">
          
          <div class="relative">
            <label class="block text-sm font-bold text-slate-700 mb-2">Current Password</label>
            <input 
              v-model="currentPassword" 
              :type="showCurrent ? 'text' : 'password'" 
              class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-navy focus:ring-1 focus:ring-navy outline-none transition pr-12"
              placeholder="Enter current password"
            />
            <button type="button" @click="showCurrent = !showCurrent" class="absolute right-4 top-[42px] text-gray-400 hover:text-navy transition">
              <svg v-if="!showCurrent" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
            </button>
          </div>

          <div class="relative">
            <label class="block text-sm font-bold text-slate-700 mb-2">New Password</label>
            <input 
              v-model="newPassword" 
              :type="showNew ? 'text' : 'password'" 
              class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-navy focus:ring-1 focus:ring-navy outline-none transition pr-12"
              placeholder="Min. 8 characters"
            />
            <button type="button" @click="showNew = !showNew" class="absolute right-4 top-[42px] text-gray-400 hover:text-navy transition">
              <svg v-if="!showNew" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
            </button>
          </div>

          <div class="relative">
            <label class="block text-sm font-bold text-slate-700 mb-2">Confirm New Password</label>
            <input 
              v-model="confirmPassword" 
              :type="showConfirm ? 'text' : 'password'" 
              class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-navy focus:ring-1 focus:ring-navy outline-none transition pr-12"
              placeholder="Re-enter new password"
            />
            <button type="button" @click="showConfirm = !showConfirm" class="absolute right-4 top-[42px] text-gray-400 hover:text-navy transition">
              <svg v-if="!showConfirm" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
              <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
            </button>
          </div>

          <div class="pt-4 flex justify-between items-center">
            <NuxtLink to="/dashboard/forgot-password" class="text-sm text-navy hover:underline">Forgot Password?</NuxtLink>
            <button type="submit" class="bg-orange text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-hover transition shadow-md">
              Update Password
            </button>
          </div>

        </form>
      </div>
    </div>
  </div>
</template>