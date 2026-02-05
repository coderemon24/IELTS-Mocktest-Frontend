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

onMounted(fetchOrders)
</script>

<template>
  <div class="min-h-[calc(100vh-80px)] bg-offwhite">
    <div class="container mx-auto px-4 py-12">
      <div class="max-w-5xl mx-auto space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-navy">My Orders</h1>
            <p class="text-sm text-slate-500">Track your package purchases.</p>
          </div>
          <NuxtLink to="/" class="text-sm font-semibold text-slate-500 hover:text-navy">Browse Packages</NuxtLink>
        </div>

        <div v-if="errorMessage" class="bg-rose-50 border border-rose-200 text-rose-900 rounded-xl p-4 text-sm">
          {{ errorMessage }}
        </div>

        <div v-else class="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div v-if="isLoading" class="p-6 text-slate-500">Loading orders...</div>
          <table v-else class="w-full text-sm">
            <thead class="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th class="px-6 py-3 text-left">Order</th>
                <th class="px-6 py-3 text-left">Package</th>
                <th class="px-6 py-3 text-left">Total</th>
                <th class="px-6 py-3 text-left">Status</th>
                <th class="px-6 py-3 text-left">Date</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="order in orders" :key="order.id" class="hover:bg-slate-50">
                <td class="px-6 py-4 font-semibold text-navy">{{ order.order_no }}</td>
                <td class="px-6 py-4 text-slate-600">{{ order.plan?.name }}</td>
                <td class="px-6 py-4 text-slate-600">{{ order.currency }} {{ order.total }}</td>
                <td class="px-6 py-4">
                  <span
                    :class="[
                      'text-xs font-bold px-2 py-1 rounded-full',
                      order.status === 'paid' ? 'bg-emerald-100 text-emerald-700' :
                      order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                      order.status === 'failed' ? 'bg-rose-100 text-rose-700' :
                      'bg-slate-100 text-slate-500'
                    ]"
                  >
                    {{ order.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-slate-500">{{ order.created_at }}</td>
              </tr>
              <tr v-if="orders.length === 0">
                <td colspan="5" class="px-6 py-8 text-center text-slate-500">No orders found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
