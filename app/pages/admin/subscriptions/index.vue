<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

const { $axios } = useNuxtApp()

const subscriptions = ref<any[]>([])
const isLoading = ref(true)
const errorMessage = ref<string | null>(null)
const status = ref('')
const page = ref(1)
const perPage = ref(20)
const pageInput = ref(1)
const meta = ref<any | null>(null)

const fetchSubscriptions = async () => {
  isLoading.value = true
  errorMessage.value = null

  try {
    const response = await $axios.get('/admin/subscriptions', {
      params: {
        status: status.value || undefined,
        page: page.value,
        per_page: perPage.value,
      },
    })
    subscriptions.value = response?.data?.data || []
    meta.value = response?.data?.meta || null
    pageInput.value = meta.value?.current_page || page.value
  } catch (e: any) {
    errorMessage.value =
      e?.response?.data?.message || e?.message || 'Failed to load subscriptions.'
  } finally {
    isLoading.value = false
  }
}

const updateStatus = async (sub: any, newStatus: string) => {
  try {
    await $axios.patch(`/admin/subscriptions/${sub.id}`, {
      status: newStatus,
    })
    await fetchSubscriptions()
  } catch (e: any) {
    alert(e?.response?.data?.message || e?.message || 'Update failed.')
  }
}

const nextPage = () => {
  if (meta.value && page.value < meta.value.last_page) {
    page.value += 1
    fetchSubscriptions()
  }
}

const prevPage = () => {
  if (page.value > 1) {
    page.value -= 1
    fetchSubscriptions()
  }
}

const jumpToPage = () => {
  if (!meta.value) return
  const target = Math.max(1, Math.min(Number(pageInput.value), meta.value.last_page))
  page.value = target
  fetchSubscriptions()
}

onMounted(fetchSubscriptions)
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60">
      <div>
        <h1 class="text-xl font-bold text-navy">Subscriptions</h1>
        <p class="text-xs text-slate-500 font-medium">Manage active and expired subscriptions.</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <select v-model="status" class="px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="expired">Expired</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select v-model="perPage" class="px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200">
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
        <button class="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200" @click="fetchSubscriptions">Filter</button>
      </div>
    </div>

    <div v-if="errorMessage" class="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 text-sm">
      {{ errorMessage }}
    </div>

    <div class="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
      <div v-if="isLoading" class="p-6 text-slate-500">Loading subscriptions...</div>
      <table v-else class="w-full text-left text-xs">
        <thead class="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
          <tr>
            <th class="px-6 py-3">Student</th>
            <th class="px-6 py-3">Plan</th>
            <th class="px-6 py-3">Status</th>
            <th class="px-6 py-3">Starts</th>
            <th class="px-6 py-3">Ends</th>
            <th class="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="sub in subscriptions" :key="sub.id" class="hover:bg-slate-50">
            <td class="px-6 py-4 text-slate-600">{{ sub.user?.name || sub.user?.email || sub.user_id }}</td>
            <td class="px-6 py-4 text-slate-600">{{ sub.plan?.name }}</td>
            <td class="px-6 py-4 text-slate-600">{{ sub.status }}</td>
            <td class="px-6 py-4 text-slate-500">{{ sub.starts_at }}</td>
            <td class="px-6 py-4 text-slate-500">{{ sub.ends_at || 'N/A' }}</td>
            <td class="px-6 py-4 text-right">
              <select class="px-2 py-1 text-xs border border-slate-200 rounded" :value="sub.status" @change="updateStatus(sub, ($event.target as HTMLSelectElement).value)">
                <option value="active">active</option>
                <option value="expired">expired</option>
                <option value="cancelled">cancelled</option>
              </select>
            </td>
          </tr>
          <tr v-if="subscriptions.length === 0">
            <td colspan="6" class="px-6 py-10 text-center text-slate-500">No subscriptions found.</td>
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
