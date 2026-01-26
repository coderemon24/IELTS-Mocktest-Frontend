<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import gsap from 'gsap'

definePageMeta({
  middleware: 'admin-auth'
})

// State Management
const email = ref('')
const password = ref('')
const isLoading = ref(false)
const showPassword = ref(false) 
// Router
const router = useRouter()

// Access global axios and cookies
const auth = useAuthStore()
const { $axios } = useNuxtApp()

const handleLogin = async () => {
  if (!email.value || !password.value) return
  
  isLoading.value = true
  try {
    const response = await $axios.post('/admin/login', {
      email: email.value,
      password: password.value
    })

    if (response.data.access_token) {
      auth.login(response.data.access_token)
      navigateTo('/admin')
    }
  } catch (error: any) {
    console.error('Auth Error:', error.response?.data || error.message)
    alert(error.response?.data?.message || 'Authentication failed')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  gsap.from('.login-card', {
    y: 30,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
  })

  const shapes = document.querySelectorAll('.floating-shape')
  shapes.forEach((shape) => {
    gsap.to(shape, {
      y: "random(-30, 30)",
      x: "random(-20, 20)",
      rotation: "random(-20, 20)",
      duration: "random(4, 7)",
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    })
  })
})
</script>

<template>
  <div class="min-h-screen bg-offwhite flex items-center justify-center p-4 relative overflow-hidden font-sans">
    
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-50 rounded-full blur-3xl opacity-60 mix-blend-multiply floating-shape"></div>
      <div class="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange/10 rounded-full blur-3xl opacity-60 mix-blend-multiply floating-shape"></div>
      
      <svg class="floating-shape absolute top-20 left-[15%] w-16 h-16 text-navy/10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a9 9 0 0 0-9 9v7a3 3 0 0 0 3 3h3v-8H4a7 7 0 0 1 7-7 7 7 0 0 1 7 7h-5v8h3a3 3 0 0 0 3-3v-7a9 9 0 0 0-9-9z"/></svg>
      <svg class="floating-shape absolute bottom-20 right-[15%] w-24 h-24 text-mint/20" fill="currentColor" viewBox="0 0 24 24"><path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z"/></svg>
    </div>

    <div class="login-card w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10 border border-white/50">
      
      <div class="w-full md:w-5/12 bg-navy p-12 text-white relative overflow-hidden flex flex-col justify-between">
        <div class="absolute inset-0 bg-gradient-to-br from-navy to-blue-900 z-0"></div>
        <div class="absolute inset-0 opacity-10" style="background-image: radial-gradient(#ffffff 1px, transparent 1px); background-size: 20px 20px;"></div>
        
        <div class="relative z-10">
          <div class="flex items-center gap-2 mb-8">
            <div class="w-8 h-8 bg-mint rounded-lg flex items-center justify-center text-navy font-bold text-lg">I</div>
            <span class="font-bold text-xl tracking-wide">IELTS BD</span>
          </div>
          <h2 class="text-3xl font-bold leading-tight mb-4">Welcome Back,<br/>Administrator</h2>
          <p class="text-blue-100 text-sm leading-relaxed">Control your platform efficiently. Manage exams, users, and analyze performance data securely.</p>
        </div>

        <div class="relative z-10 mt-10">
          <div class="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
            <div class="flex items-center gap-3 mb-2">
              <div class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span class="text-xs font-bold uppercase tracking-wider text-green-300">System Status</span>
            </div>
            <div class="flex justify-between text-sm">
              <span>Active Users</span>
              <span class="font-bold">1,245</span>
            </div>
          </div>
        </div>
      </div>

      <div class="w-full md:w-7/12 p-12 bg-white flex flex-col justify-center">
        <div class="max-w-md mx-auto w-full">
          <h3 class="text-2xl font-bold text-navy mb-1">Sign In</h3>
          <p class="text-slate-500 mb-8 text-sm">Please enter your credentials to access the dashboard.</p>

          <form @submit.prevent="handleLogin" class="space-y-6">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
              <div class="relative">
                <span class="absolute left-4 top-3.5 text-slate-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path></svg>
                </span>
                <input 
                  v-model="email" 
                  type="email" 
                  class="w-full pl-12 pr-4 py-3 bg-offwhite border border-gray-200 rounded-xl focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition text-slate-700"
                  placeholder="admin@kaienit.com"
                  required
                >
              </div>
            </div>

            <div>
              <div class="flex justify-between mb-2">
                <label class="block text-sm font-medium text-slate-700">Password</label>
                <a href="#" class="text-sm text-orange font-semibold hover:underline">Forgot?</a>
              </div>
              <div class="relative">
                <span class="absolute left-4 top-3.5 text-slate-400">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                </span>
                <input 
                  v-model="password" 
                  :type="showPassword ? 'text' : 'password'" 
                  class="w-full pl-12 pr-12 py-3 bg-offwhite border border-gray-200 rounded-xl focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy transition text-slate-700"
                  placeholder="••••••••"
                  required
                >
                <button 
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute right-4 top-3.5 text-slate-400 hover:text-navy transition"
                >
                  <svg v-if="!showPassword" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88L4.573 4.574m14.854 14.854L14.12 14.12M17.657 16.657L13.414 12.414m6.332-6.332a9.99 9.99 0 011.542 3.918c-.337.959-.83 1.848-1.455 2.627M12 5c1.173 0 2.29.204 3.322.576" />
                  </svg>
                </button>
              </div>
            </div>

            <div class="flex items-center">
              <input id="remember-me" type="checkbox" class="h-4 w-4 text-navy border-gray-300 rounded focus:ring-navy cursor-pointer">
              <label for="remember-me" class="ml-2 block text-sm text-slate-600 cursor-pointer">
                Remember me for 30 days
              </label>
            </div>

            <button 
              type="submit" 
              class="w-full bg-navy text-white py-4 rounded-xl font-bold text-lg hover:bg-navy-light shadow-lg hover:shadow-orange/20 transition transform active:scale-95 flex items-center justify-center gap-2"
              :disabled="isLoading"
            >
              <svg v-if="isLoading" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span v-else>Sign In to Dashboard</span>
            </button>
          </form>

          <div class="mt-8 text-center">
            <p class="text-xs text-slate-400">Protected by Kaien IT Security Systems</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>