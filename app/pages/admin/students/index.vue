<script setup lang="ts">
import { ref } from 'vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

const { $axios } = useNuxtApp()

const students = ref<any[]>([])
const isLoading = ref(true)
const errorMessage = ref<string | null>(null)
const query = ref('')
const page = ref(1)
const perPage = ref(20)
const pageInput = ref(1)
const meta = ref<any | null>(null)

const fetchStudents = async () => {
  isLoading.value = true
  errorMessage.value = null

  try {
    const response = await $axios.get('/admin/students', {
      params: {
        search: query.value || undefined,
        page: page.value,
        per_page: perPage.value,
      },
    })
    students.value = response?.data?.data || []
    meta.value = response?.data?.meta || null
    pageInput.value = meta.value?.current_page || page.value
  } catch (e: any) {
    errorMessage.value =
      e?.response?.data?.message || e?.message || 'Failed to load students.'
  } finally {
    isLoading.value = false
  }
}

const nextPage = () => {
  if (meta.value && page.value < meta.value.last_page) {
    page.value += 1
    fetchStudents()
  }
}

const prevPage = () => {
  if (page.value > 1) {
    page.value -= 1
    fetchStudents()
  }
}

const jumpToPage = () => {
  if (!meta.value) return
  const target = Math.max(1, Math.min(Number(pageInput.value), meta.value.last_page))
  page.value = target
  fetchStudents()
}

onMounted(fetchStudents)
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200/60">
      <div>
        <h1 class="text-xl font-bold text-navy">Students</h1>
        <p class="text-xs text-slate-500 font-medium">Manage enrolled students.</p>
      </div>
      <div class="flex gap-2 flex-wrap">
        <input v-model="query" type="text" placeholder="Search by name or email" class="w-64 px-4 py-2 text-sm rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-mint/40" />
        <select v-model="perPage" class="px-3 py-2 text-xs rounded-lg bg-slate-50 border border-slate-200">
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
          <option :value="100">100</option>
        </select>
        <button class="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition" @click="fetchStudents">Search</button>
      </div>
    </div>

    <div v-if="errorMessage" class="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 text-sm">
      {{ errorMessage }}
    </div>

    <div class="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
      <div v-if="isLoading" class="p-6 text-slate-500">Loading students...</div>
      <table v-else class="w-full text-left text-xs">
        <thead class="bg-slate-50 text-slate-400 font-bold uppercase tracking-wider">
          <tr>
            <th class="px-6 py-3">Name</th>
            <th class="px-6 py-3">Email</th>
            <th class="px-6 py-3">Active Plan</th>
            <th class="px-6 py-3">Joined</th>
            <th class="px-6 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          <tr v-for="student in students" :key="student.id" class="hover:bg-slate-50">
            <td class="px-6 py-4 font-bold text-navy">{{ student.name }}</td>
            <td class="px-6 py-4 text-slate-600">{{ student.email }}</td>
            <td class="px-6 py-4 text-slate-600">
              {{ student.active_subscription?.plan?.name || 'None' }}
            </td>
            <td class="px-6 py-4 text-slate-500">{{ student.created_at }}</td>
            <td class="px-6 py-4 text-right">
              <NuxtLink :to="`/admin/students/${student.id}`" class="text-navy hover:text-navy-light text-xs font-bold">View</NuxtLink>
            </td>
          </tr>
          <tr v-if="students.length === 0">
            <td colspan="5" class="px-6 py-10 text-center text-slate-500">No students found.</td>
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
