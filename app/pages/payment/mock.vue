<script setup lang="ts">
const { $axios } = useNuxtApp()
const route = useRoute()

const token = computed(() => String(route.query.token || ''))
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

const submitStatus = async (status: 'success' | 'failed') => {
  if (!token.value) {
    errorMessage.value = 'Missing payment token.'
    return
  }
  errorMessage.value = null
  isSubmitting.value = true

  try {
    const response = await $axios.post('/payments/callback', {
      provider: 'mock',
      status,
      token: token.value,
    })

    const orderId = response?.data?.data?.order?.id
    if (!orderId) throw new Error('Order not found in callback response.')

    const target = status === 'success' ? 'success' : 'failed'
    await navigateTo(`/payment/${target}?order=${orderId}`)
  } catch (e: any) {
    errorMessage.value =
      e?.response?.data?.data?.message ||
      e?.response?.data?.message ||
      e?.message ||
      'Payment processing failed.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-[calc(100vh-80px)] bg-offwhite flex items-center">
    <div class="container mx-auto px-4 py-12">
      <div class="max-w-xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
        <h1 class="text-2xl font-bold text-navy">Mock Payment</h1>
        <p class="text-sm text-slate-500 mt-2">Choose a result to simulate the payment gateway response.</p>

        <div v-if="errorMessage" class="mt-6 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl p-4 text-sm">
          {{ errorMessage }}
        </div>

        <div class="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            class="flex-1 bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition disabled:opacity-60"
            :disabled="isSubmitting"
            @click="submitStatus('success')"
          >
            {{ isSubmitting ? 'Processing...' : 'Simulate Success' }}
          </button>
          <button
            class="flex-1 bg-rose-600 text-white font-bold py-3 rounded-xl hover:bg-rose-700 transition disabled:opacity-60"
            :disabled="isSubmitting"
            @click="submitStatus('failed')"
          >
            {{ isSubmitting ? 'Processing...' : 'Simulate Failed' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
