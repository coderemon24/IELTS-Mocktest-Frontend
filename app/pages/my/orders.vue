<script setup lang="ts">
definePageMeta({
  middleware: 'user-auth',
})

const { $axios } = useNuxtApp()

const orders = ref<any[]>([])
const isLoading = ref(true)
const errorMessage = ref<string | null>(null)

const fetchOrders = async () => {
  isLoading.value = true
  errorMessage.value = null
  try {
    const response = await $axios.get('/my/orders')
    orders.value = response?.data?.data || []
  } catch (e: any) {
    errorMessage.value =
      e?.response?.data?.message || e?.message || 'Failed to load orders.'
  } finally {
    isLoading.value = false
  }
}

const statusBadge = (status: string) => {
  if (status === 'paid') return 'bg-emerald-100 text-emerald-700'
  if (status === 'pending') return 'bg-amber-100 text-amber-700'
  if (status === 'failed') return 'bg-rose-100 text-rose-700'
  return 'bg-slate-100 text-slate-500'
}

onMounted(fetchOrders)
</script>

<template>
  <div class="min-h-[calc(100vh-80px)] bg-offwhite">
    <div class="container mx-auto px-4 py-12">
      <div class="max-w-6xl mx-auto space-y-8">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p class="text-xs font-bold uppercase tracking-widest text-orange">Orders</p>
            <h1 class="text-3xl font-bold text-navy">My Orders</h1>
            <p class="text-sm text-slate-500">Track your package purchases and payment status.</p>
          </div>
          <div class="flex gap-2">
            <NuxtLink to="/my/subscriptions" class="px-4 py-2 text-sm font-semibold text-navy border border-gray-200 rounded-xl hover:border-navy hover:bg-slate-50 transition">My Subscriptions</NuxtLink>
            <NuxtLink to="/" class="px-4 py-2 text-sm font-semibold text-white bg-navy rounded-xl hover:bg-navy-light transition">Browse Packages</NuxtLink>
          </div>
        </div>

        <div v-if="errorMessage" class="bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl p-4 text-sm">
          {{ errorMessage }}
        </div>

        <div v-else class="space-y-4">
          <div v-if="isLoading" class="bg-white rounded-3xl border border-gray-100 p-8 text-slate-500">Loading orders...</div>

          <div v-else-if="orders.length === 0" class="bg-white rounded-3xl border border-gray-100 p-8 text-center">
            <p class="text-slate-500">No orders found.</p>
            <NuxtLink to="/" class="inline-flex mt-4 px-4 py-2 text-sm font-semibold text-white bg-navy rounded-xl hover:bg-navy-light transition">Buy a Package</NuxtLink>
          </div>

          <div v-else class="grid md:grid-cols-2 gap-4">
            <div v-for="order in orders" :key="order.id" class="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-xs text-slate-400">Order No</p>
                  <p class="text-lg font-bold text-navy">{{ order.order_no }}</p>
                </div>
                <span :class="['text-xs font-bold px-2 py-1 rounded-full', statusBadge(order.status)]">{{ order.status }}</span>
              </div>

              <div class="mt-4">
                <p class="text-sm text-slate-500">Package</p>
                <p class="text-base font-semibold text-navy">{{ order.plan?.name }}</p>
              </div>

              <div class="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p class="text-xs text-slate-400">Total</p>
                  <p class="font-bold text-navy">{{ order.currency }} {{ order.total }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-400">Date</p>
                  <p class="text-sm text-slate-600">{{ order.created_at }}</p>
                </div>
              </div>

              <div class="mt-5 flex gap-2">
                <NuxtLink :to="`/payment/${order.status === 'paid' ? 'success' : 'failed'}?order=${order.id}`" class="px-3 py-2 text-xs font-bold rounded-lg border border-gray-200 text-slate-600 hover:border-navy hover:text-navy transition">
                  View Details
                </NuxtLink>
                <NuxtLink :to="`/checkout/${order.plan?.id}`" class="px-3 py-2 text-xs font-bold rounded-lg bg-navy text-white hover:bg-navy-light transition">
                  Buy Again
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
