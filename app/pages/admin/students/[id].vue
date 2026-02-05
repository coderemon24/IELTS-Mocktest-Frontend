<script setup lang="ts">

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

const { $axios } = useNuxtApp()
const route = useRoute()

const student = ref<any | null>(null)
const isLoading = ref(true)
const errorMessage = ref<string | null>(null)

const fetchStudent = async () => {
  isLoading.value = true
  errorMessage.value = null

  try {
    const response = await $axios.get(`/admin/students/${route.params.id}`)
    student.value = response?.data?.data || null
  } catch (e: any) {
    errorMessage.value =
      e?.response?.data?.message || e?.message || 'Failed to load student.'
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchStudent)
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-xl font-bold text-navy">Student Details</h1>
        <p class="text-xs text-slate-500">View subscriptions and orders.</p>
      </div>
      <NuxtLink to="/admin/students" class="text-xs font-bold text-slate-500 hover:text-navy">Back</NuxtLink>
    </div>

    <div v-if="errorMessage" class="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 text-sm">
      {{ errorMessage }}
    </div>

    <div v-else-if="isLoading" class="text-slate-500">Loading student...</div>

    <div v-else-if="student" class="space-y-6">
      <div class="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
        <h2 class="text-lg font-bold text-navy">{{ student.name }}</h2>
        <p class="text-sm text-slate-500">{{ student.email }}</p>
        <p class="text-xs text-slate-400 mt-2">Joined: {{ student.created_at }}</p>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
        <h3 class="text-sm font-bold text-navy mb-3">Subscriptions</h3>
        <table class="w-full text-xs">
          <thead class="text-slate-400 uppercase">
            <tr>
              <th class="text-left py-2">Plan</th>
              <th class="text-left py-2">Status</th>
              <th class="text-left py-2">Start</th>
              <th class="text-left py-2">End</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="sub in student.subscriptions || []" :key="sub.id">
              <td class="py-2 font-semibold text-navy">{{ sub.plan?.name }}</td>
              <td class="py-2 text-slate-600">{{ sub.status }}</td>
              <td class="py-2 text-slate-500">{{ sub.starts_at }}</td>
              <td class="py-2 text-slate-500">{{ sub.ends_at || 'N/A' }}</td>
            </tr>
            <tr v-if="(student.subscriptions || []).length === 0">
              <td colspan="4" class="py-4 text-center text-slate-400">No subscriptions found.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
        <h3 class="text-sm font-bold text-navy mb-3">Orders</h3>
        <table class="w-full text-xs">
          <thead class="text-slate-400 uppercase">
            <tr>
              <th class="text-left py-2">Order</th>
              <th class="text-left py-2">Plan</th>
              <th class="text-left py-2">Status</th>
              <th class="text-left py-2">Total</th>
              <th class="text-left py-2">Date</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="order in student.orders || []" :key="order.id">
              <td class="py-2 font-semibold text-navy">{{ order.order_no }}</td>
              <td class="py-2 text-slate-600">{{ order.plan?.name }}</td>
              <td class="py-2 text-slate-600">{{ order.status }}</td>
              <td class="py-2 text-slate-600">{{ order.currency }} {{ order.total }}</td>
              <td class="py-2 text-slate-500">{{ order.created_at }}</td>
            </tr>
            <tr v-if="(student.orders || []).length === 0">
              <td colspan="5" class="py-4 text-center text-slate-400">No orders found.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
