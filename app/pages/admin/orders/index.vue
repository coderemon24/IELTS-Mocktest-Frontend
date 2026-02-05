<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

const { $axios } = useNuxtApp()

const orders = ref<any[]>([])
const isLoading = ref(true)
const errorMessage = ref<string | null>(null)
const status = ref('')
const paymentStatus = ref('')
const dateFrom = ref('')
const dateTo = ref('')
const page = ref(1)
const perPage = ref(20)
const pageInput = ref(1)
const meta = ref<any | null>(null)

const fetchOrders = async () => {
  isLoading.value = true
  errorMessage.value = null

  try {
    const response = await $axios.get('/admin/orders', {
      params: {
        status: status.value || undefined,
        payment_status: paymentStatus.value || undefined,
        date_from: dateFrom.value || undefined,
        date_to: dateTo.value || undefined,
        page: page.value,
        per_page: perPage.value,
      },
    })
    orders.value = response?.data?.data || []
    meta.value = response?.data?.meta || null
    pageInput.value = meta.value?.current_page || page.value
  } catch (e: any) {
    errorMessage.value =
      e?.response?.data?.message || e?.message || 'Failed to load orders.'
  } finally {
    isLoading.value = false
  }
}

const nextPage = () => {
  if (meta.value && page.value < meta.value.last_page) {
    page.value += 1
    fetchOrders()
  }
}

const prevPage = () => {
  if (page.value > 1) {
    page.value -= 1
    fetchOrders()
  }
}

const jumpToPage = () => {
  if (!meta.value) return
  const target = Math.max(1, Math.min(Number(pageInput.value), meta.value.last_page))
  page.value = target
  fetchOrders()
}

onMounted(fetchOrders)
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60">
      <div>
        <h1 class="text-xl font-bold text-navy">Orders</h1>
        <p class="text-xs text-slate-500 font-medium">Track package orders.</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <select v-model="status" class="px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select v-model="paymentStatus" class="px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200">
          <option value="">All Payment</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input v-model="dateFrom" type="date" class="px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200" />
        <input v-model="dateTo" type="date" class="px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200" />
        <select v-model="perPage" class="px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200">
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
        <button class="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200" @click="fetchOrders">Filter</button>
      </div>
    </div>

    <div v-if="errorMessage" class="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 text-sm">
      {{ errorMessage }}
    </div>

    <div class="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
      <div v-if="isLoading" class="p-6 text-slate-500">Loading orders...</div>
      <table v-else class="w-full text-left text-xs">
        <thead class="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
          <tr>
            <th class="px-6 py-3">Order</th>
            <th class="px-6 py-3">Student</th>
            <th class="px-6 py-3">Plan</th>
            <th class="px-6 py-3">Total</th>
            <th class="px-6 py-3">Status</th>
            <th class="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="order in orders" :key="order.id" class="hover:bg-slate-50">
            <td class="px-6 py-4 font-bold text-navy">{{ order.order_no }}</td>
            <td class="px-6 py-4 text-slate-600">{{ order.user?.name }}</td>
            <td class="px-6 py-4 text-slate-600">{{ order.plan?.name }}</td>
            <td class="px-6 py-4 text-slate-600">{{ order.currency }} {{ order.total }}</td>
            <td class="px-6 py-4 text-slate-600">{{ order.status }}</td>
            <td class="px-6 py-4 text-right">
              <NuxtLink :to="`/admin/orders/${order.id}`" class="text-navy hover:text-navy-light text-xs font-bold">View</NuxtLink>
            </td>
          </tr>
          <tr v-if="orders.length === 0">
            <td colspan="6" class="px-6 py-10 text-center text-slate-500">No orders found.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-slate-500" v-if="meta">
      <span>Page {{ meta.current_page }} of {{ meta.last_page }}</span>
      <div class="flex flex-wrap gap-2 items-center">
        <div class="flex items-center gap-2">
          <span>Go to</span>
          <input v-model.number="pageInput" type="number" min="1" :max="meta.last_page" class="w-20 px-2 py-1 rounded border border-slate-200" />
          <button class="px-3 py-1 rounded-lg border border-slate-200" @click="jumpToPage">Go</button>
        </div>
        <button class="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-50" :disabled="page <= 1" @click="prevPage">Prev</button>
        <button class="px-3 py-1 rounded-lg border border-slate-200 disabled:opacity-50" :disabled="page >= meta.last_page" @click="nextPage">Next</button>
      </div>
    </div>
  </div>
</template>
