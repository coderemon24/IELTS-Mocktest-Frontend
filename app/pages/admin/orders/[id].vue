<script setup lang="ts">

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

const { $axios } = useNuxtApp()
const route = useRoute()

const order = ref<any | null>(null)
const isLoading = ref(true)
const errorMessage = ref<string | null>(null)

const fetchOrder = async () => {
  isLoading.value = true
  errorMessage.value = null

  try {
    const response = await $axios.get(`/admin/orders/${route.params.id}`)
    order.value = response?.data?.data || null
  } catch (e: any) {
    errorMessage.value =
      e?.response?.data?.message || e?.message || 'Failed to load order.'
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchOrder)
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-navy">Order Details</h1>
        <p class="text-xs text-slate-500">Review order, payment and subscription.</p>
      </div>
      <NuxtLink to="/admin/orders" class="text-xs font-bold text-slate-500 hover:text-navy">Back</NuxtLink>
    </div>

    <div v-if="errorMessage" class="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 text-sm">
      {{ errorMessage }}
    </div>

    <div v-else-if="isLoading" class="text-slate-500">Loading order...</div>

    <div v-else-if="order" class="space-y-6">
      <div class="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
        <h2 class="text-lg font-bold text-navy">{{ order.order_no }}</h2>
        <p class="text-sm text-slate-500">{{ order.user?.name }} • {{ order.user?.email }}</p>
        <div class="mt-4 grid sm:grid-cols-3 gap-4 text-sm">
          <div class="bg-slate-50 rounded-xl p-4">
            <p class="text-xs text-slate-500">Plan</p>
            <p class="font-bold text-navy">{{ order.plan?.name }}</p>
          </div>
          <div class="bg-slate-50 rounded-xl p-4">
            <p class="text-xs text-slate-500">Total</p>
            <p class="font-bold text-navy">{{ order.currency }} {{ order.total }}</p>
          </div>
          <div class="bg-slate-50 rounded-xl p-4">
            <p class="text-xs text-slate-500">Status</p>
            <p class="font-bold text-navy">{{ order.status }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
        <h3 class="text-sm font-bold text-navy mb-3">Payments</h3>
        <table class="w-full text-xs">
          <thead class="text-slate-400 uppercase">
            <tr>
              <th class="text-left py-2">Provider</th>
              <th class="text-left py-2">Amount</th>
              <th class="text-left py-2">Status</th>
              <th class="text-left py-2">Transaction</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="pay in order.payments || []" :key="pay.id">
              <td class="py-2 text-slate-600">{{ pay.provider }}</td>
              <td class="py-2 text-slate-600">{{ pay.currency }} {{ pay.amount }}</td>
              <td class="py-2 text-slate-600">{{ pay.status }}</td>
              <td class="py-2 text-slate-500">{{ pay.transaction_id || 'N/A' }}</td>
            </tr>
            <tr v-if="(order.payments || []).length === 0">
              <td colspan="4" class="py-4 text-center text-slate-400">No payments found.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
        <h3 class="text-sm font-bold text-navy mb-3">Subscription</h3>
        <p v-if="order.subscription">{{ order.subscription.status }} • {{ order.subscription.starts_at }} - {{ order.subscription.ends_at || 'N/A' }}</p>
        <p v-else class="text-slate-400 text-sm">No subscription linked.</p>
      </div>
    </div>
  </div>
</template>
