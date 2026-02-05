<script setup lang="ts">
import gsap from 'gsap'
import { useUserAuthStore } from '../../stores/user-auth'

definePageMeta({
  middleware: 'user-auth',
})

const auth = useUserAuthStore()

const user = computed(() => ({
  name: auth.user?.name || 'Student',
  email: auth.user?.email || '—',
  avatar: auth.user?.name
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(auth.user.name)}&background=0F172A&color=ffffff&size=256`
    : 'https://ui-avatars.com/api/?name=Student&background=0F172A&color=ffffff&size=256',
}))

onMounted(() => {
  gsap.from('.form-section', { y: 20, opacity: 0, duration: 0.6, ease: 'power2.out' })
})
</script>

<template>
  <div class="min-h-screen bg-offwhite p-6 md:p-8">
    <div class="max-w-4xl mx-auto">
      
      <h2 class="text-2xl font-bold text-navy mb-6">Profile</h2>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden form-section">
        
        <div class="h-32 bg-gradient-to-r from-navy to-blue-600 relative"></div>

        <div class="px-8 pb-8">
          <div class="relative -mt-16 mb-8 flex items-end">
            <div class="relative w-32 h-32">
              <img :src="user.avatar" alt="Avatar" class="w-32 h-32 rounded-full border-4 border-white object-cover shadow-md" />
            </div>
            <div class="ml-4 mb-2">
              <h3 class="text-xl font-bold text-navy">{{ user.name }}</h3>
              <p class="text-sm text-slate-500">Member</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
              <input :value="user.name" type="text" disabled class="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-slate-500" />
            </div>

            <div>
              <label class="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <input :value="user.email" type="email" disabled class="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-slate-500" />
            </div>

            <div class="md:col-span-2">
              <div class="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                This profile is synced from your account. Additional fields can be enabled when backend support is added.
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>
