type UserSubscription = {
  id?: number | string
  status?: string | null
  starts_at?: string | null
  ends_at?: string | null
  plan?: {
    id?: number | string
    unique_id?: string
    name?: string
  } | null
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
  const raw = String(value || '').trim()
  if (!raw) return null

  const direct = new Date(raw)
  if (!Number.isNaN(direct.getTime())) return direct

  // Fallback format: "05-Feb-26 10:30 AM"
  const parts = raw.split(' ')
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

const isSubscriptionActive = (sub: UserSubscription) => {
  if ((sub.status ?? '').toLowerCase() !== 'active') return false
  if (!sub.ends_at) return true
  const parsed = parseFormattedDate(sub.ends_at)
  if (!parsed) return true
  return parsed.getTime() >= Date.now()
}

export const useSubscriptionAccess = () => {
  const { $axios } = useNuxtApp()

  const subscriptions = ref<UserSubscription[]>([])
  const isCheckingSubscription = ref(false)
  const subscriptionError = ref<string | null>(null)

  const hasActiveSubscription = computed(() =>
    subscriptions.value.some((sub) => isSubscriptionActive(sub)),
  )

  const activeSubscription = computed(
    () => subscriptions.value.find((sub) => isSubscriptionActive(sub)) ?? null,
  )

  const refreshSubscription = async () => {
    isCheckingSubscription.value = true
    subscriptionError.value = null
    try {
      const response = await $axios.get('/my/subscriptions')
      subscriptions.value = response?.data?.data || []
    } catch (e: any) {
      subscriptionError.value =
        e?.response?.data?.message || e?.message || 'Failed to check subscription.'
      subscriptions.value = []
    } finally {
      isCheckingSubscription.value = false
    }
  }

  return {
    subscriptions,
    hasActiveSubscription,
    activeSubscription,
    isCheckingSubscription,
    subscriptionError,
    refreshSubscription,
  }
}
