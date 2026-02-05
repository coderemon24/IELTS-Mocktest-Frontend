<script setup lang="ts">
definePageMeta({
  middleware: 'user-auth',
})

const { $axios } = useNuxtApp()
const route = useRoute()

const orderId = computed(() => String(route.query.order || ''))
const order = ref<any | null>(null)
const isLoading = ref(true)
const errorMessage = ref<string | null>(null)

const fetchOrder = async () => {
  if (!orderId.value) return
  isLoading.value = true
  errorMessage.value = null
  try {
    const response = await $axios.get(`/orders/${orderId.value}`)
    order.value = response?.data?.data || null
  } catch (e: any) {
    errorMessage.value =
      e?.response?.data?.data?.message ||
      e?.response?.data?.message ||
      e?.message ||
      'Failed to load order.'
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchOrder)
</script>

<template>
  <div class="min-h-[calc(100vh-80px)] bg-offwhite">
    <div class="container mx-auto px-4 py-12">
      <div class="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div class="flex items-center gap-3">
          <div class="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-2xl">!</div>
          <div>
            <h1 class="text-2xl font-bold text-navy">Payment failed</h1>
            <p class="text-sm text-slate-500">Your payment could not be completed.</p>
          </div>
        </div>

        <div v-if="errorMessage" class="mt-6 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl p-4 text-sm">
          {{ errorMessage }}
        </div>

        <div v-else-if="isLoading" class="mt-6 text-slate-500">Loading order...</div>

        <div v-else-if="order" class="mt-6">
          <div class="grid sm:grid-cols-2 gap-4">
            <div class="bg-slate-50 rounded-2xl p-4">
              <p class="text-xs text-slate-500">Order No</p>
              <p class="font-bold text-navy">{{ order.order_no }}</p>
            </div>
            <div class="bg-slate-50 rounded-2xl p-4">
              <p class="text-xs text-slate-500">Status</p>
              <p class="font-bold text-rose-600">{{ order.status }}</p>
            </div>
            <div class="bg-slate-50 rounded-2xl p-4">
              <p class="text-xs text-slate-500">Package</p>
              <p class="font-bold text-navy">{{ order.plan?.name }}</p>
            </div>
            <div class="bg-slate-50 rounded-2xl p-4">
              <p class="text-xs text-slate-500">Total</p>
              <p class="font-bold text-navy">{{ order.currency }} {{ order.total }}</p>
            </div>
          </div>

          <div class="mt-6 flex flex-col sm:flex-row gap-3">
            <NuxtLink :to="`/checkout/${order.plan?.id}`" class="flex-1 text-center bg-navy text-white font-bold py-3 rounded-xl hover:bg-navy-light transition">
              Try Again
            </NuxtLink>
            <NuxtLink to="/my/orders" class="flex-1 text-center border border-gray-200 py-3 rounded-xl font-semibold text-slate-600 hover:border-navy hover:text-navy">
              View My Orders
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
