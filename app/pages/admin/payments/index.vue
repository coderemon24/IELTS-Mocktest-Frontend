<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

const { $axios } = useNuxtApp()

const payments = ref<any[]>([])
const isLoading = ref(true)
const errorMessage = ref<string | null>(null)
const status = ref('')
const provider = ref('')
const page = ref(1)
const perPage = ref(20)
const pageInput = ref(1)
const meta = ref<any | null>(null)

const fetchPayments = async () => {
  isLoading.value = true
  errorMessage.value = null

  try {
    const response = await $axios.get('/admin/payments', {
      params: {
        status: status.value || undefined,
        provider: provider.value || undefined,
        page: page.value,
        per_page: perPage.value,
      },
    })
    payments.value = response?.data?.data || []
    meta.value = response?.data?.meta || null
    pageInput.value = meta.value?.current_page || page.value
  } catch (e: any) {
    errorMessage.value =
      e?.response?.data?.message || e?.message || 'Failed to load payments.'
  } finally {
    isLoading.value = false
  }
}

const nextPage = () => {
  if (meta.value && page.value < meta.value.last_page) {
    page.value += 1
    fetchPayments()
  }
}

const prevPage = () => {
  if (page.value > 1) {
    page.value -= 1
    fetchPayments()
  }
}

const jumpToPage = () => {
  if (!meta.value) return
  const target = Math.max(1, Math.min(Number(pageInput.value), meta.value.last_page))
  page.value = target
  fetchPayments()
}

onMounted(fetchPayments)
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60">
      <div>
        <h1 class="text-xl font-bold text-navy">Payments</h1>
        <p class="text-xs text-slate-500 font-medium">Monitor payment activity.</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <select v-model="status" class="px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200">
          <option value="">All Status</option>
          <option value="initiated">Initiated</option>
          <option value="pending">Pending</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <input v-model="provider" type="text" placeholder="Provider" class="px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200" />
        <select v-model="perPage" class="px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200">
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
        <button class="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200" @click="fetchPayments">Filter</button>
      </div>
    </div>

    <div v-if="errorMessage" class="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 text-sm">
      {{ errorMessage }}
    </div>

    <div class="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
      <div v-if="isLoading" class="p-6 text-slate-500">Loading payments...</div>
      <table v-else class="w-full text-left text-xs">
        <thead class="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
          <tr>
            <th class="px-6 py-3">Order</th>
            <th class="px-6 py-3">Student</th>
            <th class="px-6 py-3">Provider</th>
            <th class="px-6 py-3">Amount</th>
            <th class="px-6 py-3">Status</th>
            <th class="px-6 py-3">Transaction</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="payment in payments" :key="payment.id" class="hover:bg-slate-50">
            <td class="px-6 py-4 text-slate-600">#{{ payment.order_id }}</td>
            <td class="px-6 py-4 text-slate-600">{{ payment.user_id }}</td>
            <td class="px-6 py-4 text-slate-600">{{ payment.provider }}</td>
            <td class="px-6 py-4 text-slate-600">{{ payment.currency }} {{ payment.amount }}</td>
            <td class="px-6 py-4 text-slate-600">{{ payment.status }}</td>
            <td class="px-6 py-4 text-slate-500">{{ payment.transaction_id || 'N/A' }}</td>
          </tr>
          <tr v-if="payments.length === 0">
            <td colspan="6" class="px-6 py-10 text-center text-slate-500">No payments found.</td>
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
