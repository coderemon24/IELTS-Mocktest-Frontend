<script setup lang="ts">
import gsap from 'gsap'

const { $axios } = useNuxtApp()

definePageMeta({
  middleware: 'user-guest',
})

const showPassword = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const name = ref('')
const email = ref('')
const password = ref('')
const passwordConfirm = ref('')

const fieldErrors = reactive<Record<string, string[]>>({})
const touched = reactive({
  name: false,
  email: false,
  password: false,
  password_confirmation: false,
})

const clearFieldErrors = () => {
  for (const key of Object.keys(fieldErrors)) delete fieldErrors[key]
}
const clearFieldError = (key: string) => {
  if (fieldErrors[key]) delete fieldErrors[key]
}
const fieldError = (key: string) => fieldErrors[key]?.[0] ?? null
const hasFieldError = (key: string) => !!fieldError(key)

const isNameValid = computed(() => name.value.trim().length >= 2)
const isEmailValid = computed(() => /\S+@\S+\.\S+/.test(email.value.trim()))
const isPasswordValid = computed(() => password.value.trim().length >= 8)
const isConfirmValid = computed(() => passwordConfirm.value.trim().length >= 8 && passwordConfirm.value === password.value)

const nameInputClass = computed(() => {
  if (hasFieldError('name')) return 'border-rose-500 focus:border-rose-500 focus:ring-rose-400'
  if (touched.name && isNameValid.value) return 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-400'
  return 'border-gray-200 focus:border-navy focus:ring-navy'
})

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

const confirmInputClass = computed(() => {
  if (hasFieldError('password_confirmation')) return 'border-rose-500 focus:border-rose-500 focus:ring-rose-400'
  if (touched.password_confirmation && isConfirmValid.value) return 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-400'
  return 'border-gray-200 focus:border-navy focus:ring-navy'
})

onMounted(() => {
  gsap.from('.auth-card', { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' })
})

const submit = async () => {
  errorMessage.value = null
  successMessage.value = null
  clearFieldErrors()
  isSubmitting.value = true

  try {
    const response = await $axios.post('/register', {
      name: name.value,
      email: email.value,
      password: password.value,
      password_confirmation: passwordConfirm.value,
    })

    successMessage.value =
      response?.data?.message ||
      'Registration successful. Please verify your email.'

    name.value = ''
    email.value = ''
    password.value = ''
    passwordConfirm.value = ''
    touched.name = false
    touched.email = false
    touched.password = false
    touched.password_confirmation = false
  } catch (e: any) {
    const serverErrors = e?.response?.data?.errors
    if (serverErrors && typeof serverErrors === 'object') {
      for (const [key, value] of Object.entries(serverErrors)) {
        if (Array.isArray(value)) fieldErrors[String(key)] = value as string[]
      }
    }

    if (Object.keys(fieldErrors).length === 0) {
      errorMessage.value =
        e?.response?.data?.message || e?.message || 'Registration failed.'
    }
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-[calc(100vh-80px)] flex items-center justify-center bg-offwhite relative overflow-hidden p-4">
    
    <div class="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
      <div class="absolute bottom-0 right-0 w-96 h-96 bg-mint/20 rounded-full blur-3xl opacity-50"></div>
    </div>

    <div class="auth-card w-full max-w-md bg-white rounded-3xl shadow-2xl border border-white/50 p-8 relative z-10 backdrop-blur-sm">
      
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-navy mb-2">Create Account</h1>
        <p class="text-slate-500 text-sm">Join 10,000+ students practicing daily</p>
      </div>

      <form class="space-y-4" @submit.prevent="submit">
        <div
          v-if="errorMessage"
          class="bg-rose-50 border border-rose-200 text-rose-900 rounded-xl p-3 text-sm"
        >
          {{ errorMessage }}
        </div>
        <div
          v-if="successMessage"
          class="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-3 text-sm"
        >
          {{ successMessage }}
        </div>
        
        <div>
          <label class="text-xs font-bold text-navy uppercase tracking-wide ml-1 mb-1 block">Full Name</label>
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400 group-focus-within:text-orange transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>
            </div>
            <input
              v-model="name"
              type="text"
              placeholder="Rahim Uddin"
              :class="['w-full pl-11 pr-4 py-3.5 bg-gray-50 border rounded-xl focus:bg-white focus:ring-1 outline-none transition duration-200', nameInputClass]"
              @input="clearFieldError('name')"
              @blur="touched.name = true"
            />
          </div>
          <p v-if="fieldError('name')" class="text-xs text-rose-600">{{ fieldError('name') }}</p>
        </div>

        <div>
          <label class="text-xs font-bold text-navy uppercase tracking-wide ml-1 mb-1 block">Email</label>
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

        <div>
          <label class="text-xs font-bold text-navy uppercase tracking-wide ml-1 mb-1 block">Password</label>
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400 group-focus-within:text-orange transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <input 
              v-model="password"
              :type="showPassword ? 'text' : 'password'" 
              placeholder="Min. 8 characters" 
              :class="['w-full pl-11 pr-11 py-3.5 bg-gray-50 border rounded-xl focus:bg-white focus:ring-1 outline-none transition duration-200', passwordInputClass]" 
              @input="clearFieldError('password')"
              @blur="touched.password = true"
            />
            <button type="button" @click="showPassword = !showPassword" class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-navy transition">
              <svg v-if="!showPassword" class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
              <svg v-else class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
            </button>
          </div>
          <p v-if="fieldError('password')" class="text-xs text-rose-600">{{ fieldError('password') }}</p>
        </div>

        <div>
          <label class="text-xs font-bold text-navy uppercase tracking-wide ml-1 mb-1 block">Confirm Password</label>
          <div class="relative group">
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400 group-focus-within:text-orange transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
            </div>
            <input 
              v-model="passwordConfirm"
              :type="showPassword ? 'text' : 'password'" 
              placeholder="Confirm password" 
              :class="['w-full pl-11 pr-11 py-3.5 bg-gray-50 border rounded-xl focus:bg-white focus:ring-1 outline-none transition duration-200', confirmInputClass]" 
              @input="clearFieldError('password_confirmation')"
              @blur="touched.password_confirmation = true"
            />
          </div>
          <p v-if="fieldError('password_confirmation')" class="text-xs text-rose-600">{{ fieldError('password_confirmation') }}</p>
        </div>

        <div class="flex items-center gap-2 mt-4">
          <input type="checkbox" id="terms" class="w-4 h-4 text-orange border-gray-300 rounded focus:ring-orange" />
          <label for="terms" class="text-sm text-slate-500">I agree to the <a href="#" class="text-navy font-bold hover:underline">Terms of Service</a></label>
        </div>

        <button class="w-full mt-4 bg-orange text-white font-bold py-4 rounded-xl shadow-lg shadow-orange/20 hover:shadow-xl hover:bg-orange-hover transform hover:-translate-y-0.5 transition duration-200 disabled:opacity-60" :disabled="isSubmitting">
          {{ isSubmitting ? 'Creating...' : 'Create Account' }}
        </button>

      </form>

      <div class="mt-8 text-center">
        <p class="text-slate-500 text-sm">
          Already have an account? 
          <NuxtLink to="/auth/login" class="text-navy font-bold hover:underline">Login here</NuxtLink>
        </p>
      </div>

    </div>
  </div>
</template>
