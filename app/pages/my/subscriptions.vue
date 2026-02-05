<script setup lang="ts">
definePageMeta({
  middleware: 'user-auth',
})

const { $axios } = useNuxtApp()

const subscriptions = ref<any[]>([])
const isLoading = ref(true)
const errorMessage = ref<string | null>(null)

const fetchSubscriptions = async () => {
  isLoading.value = true
  errorMessage.value = null
  try {
    const response = await $axios.get('/my/subscriptions')
    subscriptions.value = response?.data?.data || []
  } catch (e: any) {
    errorMessage.value =
      e?.response?.data?.message || e?.message || 'Failed to load subscriptions.'
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchSubscriptions)
</script>

<template>
  <div class="min-h-[calc(100vh-80px)] bg-offwhite">
    <div class="container mx-auto px-4 py-12">
      <div class="max-w-5xl mx-auto space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-2xl font-bold text-navy">My Subscriptions</h1>
            <p class="text-sm text-slate-500">See active and expired packages.</p>
          </div>
          <NuxtLink to="/my/orders" class="text-sm font-semibold text-slate-500 hover:text-navy">View Orders</NuxtLink>
        </div>

        <div v-if="errorMessage" class="bg-rose-50 border border-rose-200 text-rose-900 rounded-xl p-4 text-sm">
          {{ errorMessage }}
        </div>

        <div v-else class="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div v-if="isLoading" class="p-6 text-slate-500">Loading subscriptions...</div>
          <table v-else class="w-full text-sm">
            <thead class="bg-slate-50 text-slate-500 text-xs uppercase">
              <tr>
                <th class="px-6 py-3 text-left">Package</th>
                <th class="px-6 py-3 text-left">Status</th>
                <th class="px-6 py-3 text-left">Starts</th>
                <th class="px-6 py-3 text-left">Ends</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr v-for="sub in subscriptions" :key="sub.id" class="hover:bg-slate-50">
                <td class="px-6 py-4 font-semibold text-navy">{{ sub.plan?.name }}</td>
                <td class="px-6 py-4">
                  <span
                    :class="[
                      'text-xs font-bold px-2 py-1 rounded-full',
                      sub.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                      sub.status === 'expired' ? 'bg-amber-100 text-amber-700' :
                      'bg-rose-100 text-rose-700'
                    ]"
                  >
                    {{ sub.status }}
                  </span>
                </td>
                <td class="px-6 py-4 text-slate-500">{{ sub.starts_at }}</td>
                <td class="px-6 py-4 text-slate-500">{{ sub.ends_at || 'N/A' }}</td>
              </tr>
              <tr v-if="subscriptions.length === 0">
                <td colspan="4" class="px-6 py-8 text-center text-slate-500">No subscriptions found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
