<script setup lang="ts">
import gsap from 'gsap'
import { useUserAuthStore } from '../../stores/user-auth'

const auth = useUserAuthStore()
const { $axios } = useNuxtApp()
const route = useRoute()

definePageMeta({
  middleware: 'user-guest',
})

const showPassword = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)
const infoMessage = ref<string | null>(null)

const email = ref('')
const password = ref('')

const fieldErrors = reactive<Record<string, string[]>>({})
const touched = reactive({
  email: false,
  password: false,
})

const clearFieldErrors = () => {
  for (const key of Object.keys(fieldErrors)) delete fieldErrors[key]
}
const clearFieldError = (key: string) => {
  if (fieldErrors[key]) delete fieldErrors[key]
}
const fieldError = (key: string) => fieldErrors[key]?.[0] ?? null
const hasFieldError = (key: string) => !!fieldError(key)

const isEmailValid = computed(() => /\S+@\S+\.\S+/.test(email.value.trim()))
const isPasswordValid = computed(() => password.value.trim().length >= 8)

const emailInputClass = computed(() => {
  if (hasFieldError('email')) return 'border-rose-500 focus:border-rose-500 focus:ring-rose-400'
  if (touched.email && isEmailValid.value) return 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-400'
  return 'border-gray-200 focus:border-navy focus:ring-navy'
})

const passwordInputClass = computed(() => {
  if (hasFieldError('password')) return 'border-rose-500 focus:border-rose-500 focus:ring-rose-400'
  if (touched.password && isPasswordValid.value) return 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-400'
  return 'border-gray-200 focus:border-navy focus:ring-navy'
})

onMounted(() => {
  gsap.from('.auth-card', { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' })
})

const submit = async () => {
  errorMessage.value = null
  infoMessage.value = null
  clearFieldErrors()
  isSubmitting.value = true

  try {
    const response = await $axios.post('/login', {
      email: email.value,
      password: password.value,
    })

    const token = response?.data?.access_token
    const user = response?.data?.user
    if (!token) throw new Error('No access token received.')

    auth.login(token, user)

    const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
    await navigateTo(redirect || '/')
  } catch (e: any) {
    const serverErrors = e?.response?.data?.errors
    if (serverErrors && typeof serverErrors === 'object') {
      for (const [key, value] of Object.entries(serverErrors)) {
        if (Array.isArray(value)) fieldErrors[String(key)] = value as string[]
      }
    }

    const status = e?.response?.status
    const message = e?.response?.data?.message || e?.message || 'Login failed.'
    if (status === 403) {
      infoMessage.value = message
    } else if (Object.keys(fieldErrors).length === 0) {
      errorMessage.value = message
    }
  } finally {
    isSubmitting.value = false
  }
}

const resendVerification = async () => {
  if (!email.value) return
  infoMessage.value = null
  errorMessage.value = null
  try {
    const response = await $axios.post('/send-verification-email', {
      email: email.value,
    })
    infoMessage.value = response?.data?.message || 'Verification email sent.'
  } catch (e: any) {
    errorMessage.value =
      e?.response?.data?.message || e?.message || 'Failed to send verification.'
  }
}
</script>

<template>
  <div class="min-h-[calc(100vh-80px)] flex items-center justify-center bg-offwhite relative overflow-hidden p-4">
    
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
      <div class="absolute -top-20 -right-20 w-96 h-96 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
      <div class="absolute -bottom-20 -left-20 w-80 h-80 bg-orange/10 rounded-full blur-3xl opacity-50"></div>
    </div>

    <div class="auth-card w-full max-w-md bg-white rounded-3xl shadow-2xl border border-white/50 p-8 relative z-10 backdrop-blur-sm">
      
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-navy mb-2">Welcome Back</h1>
        <p class="text-slate-500 text-sm">Continue your journey to Band 8.0</p>
      </div>

      <form class="space-y-5" @submit.prevent="submit">
        <div
          v-if="errorMessage"
          class="bg-rose-50 border border-rose-200 text-rose-900 rounded-xl p-3 text-sm"
        >
          {{ errorMessage }}
        </div>
        <div
          v-if="infoMessage"
          class="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 text-sm"
        >
          {{ infoMessage }}
          <button
            type="button"
            class="ml-2 text-xs font-bold underline"
            @click="resendVerification"
          >
            Resend verification
          </button>
        </div>
        
        <div class="space-y-2">
          <label class="text-xs font-bold text-navy uppercase tracking-wide ml-1">Email Address</label>
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400 group-focus-within:text-orange transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"></path></svg>
            </div>
            <input
              v-model="email"
              type="email"
              placeholder="student@example.com"
              :class="['w-full pl-11 pr-4 py-3.5 bg-gray-50 border rounded-xl focus:bg-white focus:ring-1 outline-none transition duration-200', emailInputClass]"
              @input="clearFieldError('email')"
              @blur="touched.email = true"
            />
          </div>
          <p v-if="fieldError('email')" class="text-xs text-rose-600">{{ fieldError('email') }}</p>
        </div>

        <div class="space-y-2">
          <div class="flex justify-between items-center ml-1">
            <label class="text-xs font-bold text-navy uppercase tracking-wide">Password</label>
            <a href="#" class="text-xs text-orange hover:underline font-semibold">Forgot?</a>
          </div>
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400 group-focus-within:text-orange transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <input 
              v-model="password"
              :type="showPassword ? 'text' : 'password'" 
              placeholder="********" 
              :class="['w-full pl-11 pr-11 py-3.5 bg-gray-50 border rounded-xl focus:bg-white focus:ring-1 outline-none transition duration-200', passwordInputClass]"
              @input="clearFieldError('password')"
              @blur="touched.password = true"
            />
            <button type="button" @click="showPassword = !showPassword" class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-navy transition">
              <svg v-if="!showPassword" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
              <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
            </button>
          </div>
          <p v-if="fieldError('password')" class="text-xs text-rose-600">{{ fieldError('password') }}</p>
        </div>

        <button
          class="w-full bg-navy text-white font-bold py-4 rounded-xl shadow-lg shadow-navy/20 hover:shadow-xl hover:bg-navy-light transform hover:-translate-y-0.5 transition duration-200 disabled:opacity-60"
          :disabled="isSubmitting"
        >
          {{ isSubmitting ? 'Signing In...' : 'Sign In' }}
        </button>

        <div class="relative flex py-2 items-center">
          <div class="flex-grow border-t border-gray-200"></div>
          <span class="flex-shrink-0 mx-4 text-gray-400 text-xs uppercase">Or continue with</span>
          <div class="flex-grow border-t border-gray-200"></div>
        </div>

        <div class="grid grid-cols-2 gap-4">
           <button type="button" class="flex items-center justify-center py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
             <img src="https://www.svgrepo.com/show/475656/google-color.svg" class="h-5 w-5" alt="Google">
           </button>
           <button type="button" class="flex items-center justify-center py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
             <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" class="h-5 w-5" alt="Facebook">
           </button>
        </div>

      </form>

      <div class="mt-8 text-center">
        <p class="text-slate-500 text-sm">
          Don't have an account? 
          <NuxtLink to="/auth/register" class="text-orange font-bold hover:underline">Create Account</NuxtLink>
        </p>
      </div>

    </div>
  </div>
</template>
