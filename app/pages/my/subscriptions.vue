<script setup lang="ts">
definePageMeta({
  middleware: 'user-auth',
})

const { $axios } = useNuxtApp()

const subscriptions = ref<any[]>([])
const isLoading = ref(true)
const errorMessage = ref<string | null>(null)
const expiringSoonCount = computed(() =>
  subscriptions.value.filter((sub) => {
    if (!sub?.ends_at || sub?.status !== 'active') return false
    const remaining = getRemainingDays(sub.ends_at)
    return remaining !== null && remaining >= 0 && remaining <= 7
  }).length,
)

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

const statusBadge = (status: string) => {
  if (status === 'active') return 'bg-emerald-100 text-emerald-700'
  if (status === 'expired') return 'bg-amber-100 text-amber-700'
  return 'bg-rose-100 text-rose-700'
}

const monthIndex: Record<string, number> = {
  Jan: 0,
  Feb: 1,
  Mar: 2,
  Apr: 3,
  May: 4,
  Jun: 5,
  Jul: 6,
  Aug: 7,
  Sep: 8,
  Oct: 9,
  Nov: 10,
  Dec: 11,
}

const parseFormattedDate = (value: string): Date | null => {
  // Expected format: "05-Feb-26 10:30 AM"
  const parts = value.trim().split(' ')
  if (parts.length < 3) return null
  const [datePart, timePart, meridiem] = parts
  const [dayStr, monStr, yearStr] = datePart.split('-')
  const [hourStr, minuteStr] = timePart.split(':')
  const day = Number(dayStr)
  const month = monthIndex[monStr]
  let year = Number(yearStr)
  if (Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(year)) return null
  year = year < 100 ? 2000 + year : year
  let hour = Number(hourStr)
  const minute = Number(minuteStr)
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null
  const mer = meridiem.toUpperCase()
  if (mer === 'PM' && hour < 12) hour += 12
  if (mer === 'AM' && hour === 12) hour = 0
  return new Date(year, month, day, hour, minute)
}

const getRemainingDays = (endsAt: string | null) => {
  if (!endsAt) return null
  const parsed = parseFormattedDate(endsAt)
  if (!parsed) return null
  const now = new Date()
  const diff = parsed.getTime() - now.getTime()
  return Math.ceil(diff / 86400000)
}

onMounted(fetchSubscriptions)
</script>

<template>
  <div class="min-h-[calc(100vh-80px)] bg-offwhite">
    <div class="container mx-auto px-4 py-12">
      <div class="max-w-6xl mx-auto space-y-8">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p class="text-xs font-bold uppercase tracking-widest text-mint">Subscriptions</p>
            <h1 class="text-3xl font-bold text-navy">My Subscriptions</h1>
            <p class="text-sm text-slate-500">Your active and expired plans at a glance.</p>
          </div>
          <div class="flex gap-2">
            <NuxtLink to="/my/orders" class="px-4 py-2 text-sm font-semibold text-navy border border-gray-200 rounded-xl hover:border-navy hover:bg-slate-50 transition">My Orders</NuxtLink>
            <NuxtLink to="/pricing-plans" class="px-4 py-2 text-sm font-semibold text-white bg-navy rounded-xl hover:bg-navy-light transition">Browse Packages</NuxtLink>
          </div>
        </div>

        <div v-if="errorMessage" class="bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl p-4 text-sm">
          {{ errorMessage }}
        </div>

        <div v-else class="space-y-4">
          <div
            v-if="expiringSoonCount > 0"
            class="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
          >
            You have {{ expiringSoonCount }} subscription(s) expiring within the next 7 days.
          </div>

          <div v-if="isLoading" class="bg-white rounded-3xl border border-gray-100 p-8 text-slate-500">Loading subscriptions...</div>

          <div v-else-if="subscriptions.length === 0" class="bg-white rounded-3xl border border-gray-100 p-8 text-center">
            <p class="text-slate-500">No subscriptions found.</p>
            <NuxtLink to="/pricing-plans" class="inline-flex mt-4 px-4 py-2 text-sm font-semibold text-white bg-navy rounded-xl hover:bg-navy-light transition">Buy a Package</NuxtLink>
          </div>

          <div v-else class="grid md:grid-cols-2 gap-4">
            <div v-for="sub in subscriptions" :key="sub.id" class="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-xs text-slate-400">Plan</p>
                  <p class="text-lg font-bold text-navy">{{ sub.plan?.name }}</p>
                </div>
                <span :class="['text-xs font-bold px-2 py-1 rounded-full', statusBadge(sub.status)]">{{ sub.status }}</span>
              </div>

              <div class="mt-4 grid grid-cols-2 gap-4">
                <div>
                  <p class="text-xs text-slate-400">Starts</p>
                  <p class="text-sm text-slate-600">{{ sub.starts_at }}</p>
                </div>
                <div>
                  <p class="text-xs text-slate-400">Ends</p>
                  <p class="text-sm text-slate-600">{{ sub.ends_at || 'N/A' }}</p>
                </div>
              </div>

              <div v-if="sub.status === 'active'" class="mt-4">
                <p class="text-xs text-slate-400">Remaining</p>
                <p class="text-sm font-semibold text-navy">
                  {{
                    getRemainingDays(sub.ends_at) !== null
                      ? `${getRemainingDays(sub.ends_at)} day(s)`
                      : 'N/A'
                  }}
                </p>
                <p
                  v-if="getRemainingDays(sub.ends_at) !== null && getRemainingDays(sub.ends_at)! >= 0 && getRemainingDays(sub.ends_at)! <= 7"
                  class="mt-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2"
                >
                  Expiring soon. Renew to avoid interruption.
                </p>
              </div>

              <div class="mt-5 flex gap-2">
                <NuxtLink to="/pricing-plans" class="px-3 py-2 text-xs font-bold rounded-lg border border-gray-200 text-slate-600 hover:border-navy hover:text-navy transition">
                  View Packages
                </NuxtLink>
                <NuxtLink :to="`/checkout/${sub.plan?.id}`" class="px-3 py-2 text-xs font-bold rounded-lg bg-navy text-white hover:bg-navy-light transition">
                  Renew Plan
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
