<script setup lang="ts">
const { $axios } = useNuxtApp()
const route = useRoute()

const status = ref<'idle' | 'success' | 'verified' | 'invalid' | 'error'>('idle')
const message = ref<string>('')

const verify = async () => {
  const id = route.query.id
  const hash = route.query.hash

  if (!id || !hash) {
    status.value = 'invalid'
    message.value = 'Invalid verification link.'
    return
  }

  try {
    const response = await $axios.post('/verify-email', {
      id,
      hash,
    })

    const apiStatus = response?.data?.status
    status.value = apiStatus || 'success'
    message.value = response?.data?.message || 'Email verified successfully.'
  } catch (e: any) {
    status.value = 'error'
    message.value =
      e?.response?.data?.message || e?.message || 'Verification failed.'
  }
}

onMounted(verify)
</script>

<template>
  <div class="min-h-[calc(100vh-80px)] flex items-center justify-center bg-offwhite p-4">
    <div class="max-w-lg w-full bg-white rounded-3xl shadow-2xl border border-white/50 p-8">
      <h1 class="text-2xl font-bold text-navy">Email Verification</h1>
      <p class="text-sm text-slate-500 mt-2">We are verifying your email address.</p>

      <div class="mt-6">
        <div
          v-if="status === 'success' || status === 'verified'"
          class="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl p-4 text-sm"
        >
          {{ message }}
        </div>
        <div
          v-else-if="status === 'invalid'"
          class="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 text-sm"
        >
          {{ message }}
        </div>
        <div
          v-else-if="status === 'error'"
          class="bg-rose-50 border border-rose-200 text-rose-900 rounded-xl p-4 text-sm"
        >
          {{ message }}
        </div>
        <div v-else class="text-slate-500 text-sm">Checking verification link...</div>
      </div>

      <div class="mt-6 flex flex-col sm:flex-row gap-3">
        <NuxtLink to="/login" class="flex-1 text-center bg-navy text-white font-bold py-3 rounded-xl hover:bg-navy-light transition">
          Go to Login
        </NuxtLink>
        <NuxtLink to="/" class="flex-1 text-center border border-gray-200 py-3 rounded-xl font-semibold text-slate-600 hover:border-navy hover:text-navy">
          Back Home
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
