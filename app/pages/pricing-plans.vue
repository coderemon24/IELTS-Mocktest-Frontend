<script setup lang="ts">
definePageMeta({
  middleware: 'user-auth',
})

type PricingFeature = {
  id?: number | string
  unique_id?: string
  feature_key: string
  feature_value: boolean | number | string
}

type PricingPlan = {
  id?: number | string
  unique_id?: string
  name: string
  price?: number | string | null
  duration_days?: number | string | null
  is_active?: boolean | number | string | null
  features?: PricingFeature[]
  currency?: string | null
}

const { $axios } = useNuxtApp()

const normalizePlans = (payload: any): PricingPlan[] => {
  const list =
    (Array.isArray(payload) && payload) ||
    (Array.isArray(payload?.data) && payload.data) ||
    (Array.isArray(payload?.plans) && payload.plans) ||
    []
  return (list as any[]).filter(Boolean)
}

const {
  data: pricingData,
  pending: pricingPending,
  error: pricingError,
  refresh: refreshPricing,
} = useAsyncData<PricingPlan[]>('pricing:plans', async () => {
  const response = await $axios.get('/plans')
  return normalizePlans(response.data)
})

const pricingPlans = computed(() => pricingData.value ?? [])

const isFeaturedPlan = (plan: PricingPlan) =>
  String(plan.name ?? '').toLowerCase().includes('pro')

const formatPrice = (plan: PricingPlan) => {
  const priceNum = Number(plan.price ?? 0)
  if (!priceNum || Number.isNaN(priceNum)) return 'Free'
  const currency = String(plan.currency ?? '').trim()
  return currency ? `${currency} ${priceNum}` : `${priceNum}`
}

const formatInterval = (plan: PricingPlan) => {
  const priceNum = Number(plan.price ?? 0)
  if (!priceNum || Number.isNaN(priceNum)) return ''
  const days = String(plan.duration_days ?? '1 month')
  const [, txt] = days.split(' ')
  return txt ? `/ ${txt}` : '/ plan'
}

const toLabel = (key: string) =>
  key.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase())

const featureMeta = (feature: PricingFeature) => {
  const raw = feature.feature_value
  const isFalse = raw === false || raw === 'false' || raw === 0
  const isUnlimited = raw === 'unlimited'
  const isNumber =
    typeof raw === 'number' ||
    (!Number.isNaN(Number(raw)) &&
      raw !== true &&
      raw !== false &&
      raw !== 'true' &&
      raw !== 'false')

  let valueText = ''
  if (isUnlimited) valueText = 'Unlimited'
  else if (isNumber) valueText = String(raw)
  else if (raw === true || raw === 'true') valueText = ''
  else if (raw && raw !== false && raw !== 'false') valueText = String(raw)

  const label = toLabel(feature.feature_key || 'Feature')
  const text = isFalse ? `No ${label}` : valueText ? `${valueText} ${label}` : label
  return { text, muted: isFalse }
}

const handleBuy = async (plan: PricingPlan) => {
  const planId = plan.id ?? plan.unique_id
  if (!planId) return
  await navigateTo(`/checkout/${planId}`)
}
</script>

<template>
  <div class="min-h-[calc(100vh-80px)] bg-offwhite">
    <section class="py-20 bg-white border-t border-gray-100">
      <div class="container mx-auto px-4">
        <div class="text-center mb-12 max-w-3xl mx-auto">
          <p class="text-xs font-bold uppercase tracking-widest text-orange">Subscription Plans</p>
          <h1 class="text-3xl md:text-4xl font-bold text-navy mt-2">Simple, Affordable Pricing</h1>
          <p class="text-slate-500 mt-3">Choose a package and unlock full exam access. Card design and behavior are matched with the home page.</p>
        </div>

        <div class="max-w-5xl mx-auto mb-10 grid md:grid-cols-3 gap-4">
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs font-bold uppercase tracking-wide text-slate-500">Plan Access</p>
            <p class="mt-1 text-sm text-slate-700">Every active plan unlocks full Listening, Writing, Speaking, and Reading mock tests.</p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs font-bold uppercase tracking-wide text-slate-500">Billing</p>
            <p class="mt-1 text-sm text-slate-700">One-time package payment. No hidden fee. Renew anytime from your dashboard.</p>
          </div>
          <div class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p class="text-xs font-bold uppercase tracking-wide text-slate-500">Support</p>
            <p class="mt-1 text-sm text-slate-700">Need help choosing? Contact IELTS BD support before purchase for guidance.</p>
          </div>
        </div>

        <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div
            v-if="pricingError"
            class="md:col-span-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 text-sm text-center"
          >
            Failed to load plans. Please try again.
            <button
              class="ml-3 text-xs font-bold text-amber-900 underline"
              @click="refreshPricing"
            >
              Retry
            </button>
          </div>

          <div
            v-else-if="pricingPending"
            class="md:col-span-3 text-center text-slate-500"
          >
            Loading plans...
          </div>

          <template v-else>
            <div
              v-for="plan in pricingPlans"
              :key="String(plan.id ?? plan.unique_id ?? plan.name)"
              :class="[
                'p-8 rounded-2xl transition duration-300 relative overflow-hidden',
                isFeaturedPlan(plan)
                  ? 'bg-navy text-white transform md:-translate-y-4 shadow-2xl shadow-navy/30'
                  : 'border border-gray-200 hover:border-navy bg-white',
              ]"
            >
              <div
                v-if="isFeaturedPlan(plan)"
                class="absolute top-0 right-0 bg-orange text-xs font-bold px-3 py-1 rounded-bl-lg"
              >
                MOST POPULAR
              </div>
              <h3
                :class="[
                  'text-lg font-bold uppercase tracking-wide',
                  isFeaturedPlan(plan) ? 'text-slate-300' : 'text-slate-500',
                ]"
              >
                {{ plan.name }}
              </h3>
              <div class="mt-4 mb-6">
                <span
                  :class="[
                    'text-4xl font-bold',
                    isFeaturedPlan(plan) ? 'text-white' : 'text-navy',
                  ]"
                >
                  {{ formatPrice(plan) }}
                </span>
                <span
                  v-if="formatInterval(plan)"
                  :class="[
                    'text-sm',
                    isFeaturedPlan(plan) ? 'text-slate-300' : 'text-slate-500',
                  ]"
                >
                  {{ formatInterval(plan) }}
                </span>
              </div>
              <ul
                v-if="(plan.features?.length ?? 0) > 0"
                :class="[
                  'space-y-4 mb-8',
                  isFeaturedPlan(plan) ? 'text-slate-100' : 'text-slate-600',
                ]"
              >
                <li
                  v-for="feature in plan.features"
                  :key="String(feature.id ?? feature.unique_id ?? feature.feature_key)"
                  :class="['flex items-center gap-2', featureMeta(feature).muted ? 'text-gray-400' : '']"
                >
                  <span
                    :class="[
                      'inline-flex h-5 w-5 items-center justify-center rounded-full shrink-0',
                      featureMeta(feature).muted
                        ? 'bg-gray-100 text-gray-300'
                        : isFeaturedPlan(plan)
                          ? 'bg-orange/20 text-orange'
                          : 'bg-green-100 text-green-600',
                    ]"
                  >
                    <svg
                      v-if="!featureMeta(feature).muted"
                      class="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                    </svg>
                    <svg
                      v-else
                      class="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </span>
                  {{ featureMeta(feature).text }}
                </li>
              </ul>
              <p v-else class="text-sm text-slate-400 mb-8">No features listed.</p>
              <button
                :class="[
                  'w-full py-3 font-bold rounded-lg transition',
                  isFeaturedPlan(plan)
                    ? 'bg-orange text-white hover:bg-orange-hover shadow-lg'
                    : 'border-2 border-navy text-navy hover:bg-navy hover:text-white',
                ]"
                @click="handleBuy(plan)"
              >
                {{ isFeaturedPlan(plan) ? 'Get Pro Access' : 'Choose Plan' }}
              </button>
              <p
                v-if="isFeaturedPlan(plan)"
                class="text-xs text-center mt-4 text-slate-400 opacity-70"
              >
                Accepts bKash, Nagad, Rocket
              </p>
            </div>
          </template>
        </div>

        <div class="max-w-5xl mx-auto mt-12 rounded-3xl border border-slate-200 bg-navy text-white p-6 md:p-8">
          <div class="grid md:grid-cols-3 gap-6">
            <div class="md:col-span-2">
              <p class="text-xs font-bold uppercase tracking-widest text-orange">About IELTS BD</p>
              <h2 class="mt-2 text-2xl font-bold">Trusted IELTS Practice Platform</h2>
              <p class="mt-3 text-sm text-slate-200">
                IELTS BD helps students prepare with realistic exam-style practice and structured performance tracking.
                Our subscription packages are designed for consistent preparation and measurable improvement.
              </p>
            </div>
            <div class="rounded-2xl bg-white/10 border border-white/15 p-4">
              <p class="text-sm font-semibold">Why students choose us</p>
              <ul class="mt-3 space-y-2 text-sm text-slate-200">
                <li>Real exam-like interface</li>
                <li>Clear package durations</li>
                <li>Dedicated student support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
