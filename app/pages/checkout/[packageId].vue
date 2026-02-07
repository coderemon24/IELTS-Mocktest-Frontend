<script setup lang="ts">
definePageMeta({
  middleware: 'user-auth',
})

type PricingFeature = {
  id?: number | string
  feature_key: string
  feature_value: boolean | number | string
}

type PricingPlan = {
  id?: number | string
  name: string
  price?: number | string | null
  duration_days?: number | string | null
  features?: PricingFeature[]
  currency?: string | null
}

const { $axios } = useNuxtApp()
const route = useRoute()

const plan = ref<PricingPlan | null>(null)
const isLoading = ref(true)
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

const planId = computed(() => String(route.params.packageId || ''))

const fetchPlan = async () => {
  isLoading.value = true
  errorMessage.value = null
  try {
    const response = await $axios.get('/plans')
    const list = response?.data?.data || response?.data || []
    const found = (Array.isArray(list) ? list : []).find(
      (p: any) => String(p?.id) === planId.value,
    )
    plan.value = found || null
    if (!plan.value) {
      errorMessage.value = 'Package not found.'
    }
  } catch (e: any) {
    errorMessage.value =
      e?.response?.data?.message || e?.message || 'Failed to load package.'
  } finally {
    isLoading.value = false
  }
}

const startCheckout = async () => {
  if (!plan.value) return
  isSubmitting.value = true
  errorMessage.value = null

  try {
    const orderRes = await $axios.post('/orders', {
      package_id: plan.value.id,
    })
    const orderId = orderRes?.data?.data?.id
    if (!orderId) throw new Error('Order creation failed.')

    const paymentRes = await $axios.post('/payments/initiate', {
      order_id: orderId,
      provider: 'mock',
    })

    const redirectUrl = paymentRes?.data?.data?.redirect_url
    if (redirectUrl) {
      window.location.href = redirectUrl
      return
    }

    errorMessage.value = 'Payment could not be initiated.'
  } catch (e: any) {
    errorMessage.value =
      e?.response?.data?.data?.message ||
      e?.response?.data?.message ||
      e?.message ||
      'Checkout failed.'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(fetchPlan)
</script>

<template>
  <div class="min-h-[calc(100vh-80px)] bg-offwhite">
    <div class="container mx-auto px-4 py-12">
      <div class="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h1 class="text-2xl font-bold text-navy">Checkout</h1>
            <p class="text-sm text-slate-500">Confirm your package and proceed to payment.</p>
          </div>
          <NuxtLink to="/pricing-plans" class="text-sm font-semibold text-slate-500 hover:text-navy">Back to plans</NuxtLink>
        </div>

        <div v-if="errorMessage" class="mt-6 bg-rose-50 border border-rose-200 text-rose-900 rounded-xl p-4 text-sm">
          {{ errorMessage }}
        </div>

        <div v-else-if="isLoading" class="mt-6 text-slate-500">Loading package...</div>

        <div v-else-if="plan" class="mt-8">
          <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p class="text-sm text-slate-500">Package</p>
              <h2 class="text-xl font-bold text-navy">{{ plan.name }}</h2>
              <p class="text-sm text-slate-500">Duration: {{ plan.duration_days }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm text-slate-500">Total</p>
              <p class="text-3xl font-bold text-navy">{{ plan.currency || '' }} {{ plan.price }}</p>
            </div>
          </div>

          <div class="mt-6 border-t border-gray-100 pt-6">
            <p class="text-sm font-semibold text-navy mb-3">Included Features</p>
            <ul class="space-y-2 text-sm text-slate-600">
              <li v-for="feature in plan.features || []" :key="feature.id || feature.feature_key" class="flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 inline-flex items-center justify-center">
                  <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                {{ feature.feature_key }}
              </li>
              <li v-if="(plan.features || []).length === 0" class="text-slate-400">No features listed.</li>
            </ul>
          </div>

          <div class="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              class="flex-1 bg-navy text-white font-bold py-4 rounded-xl shadow-lg shadow-navy/20 hover:bg-navy-light transition disabled:opacity-60"
              :disabled="isSubmitting"
              @click="startCheckout"
            >
              {{ isSubmitting ? 'Redirecting...' : 'Proceed to Payment' }}
            </button>
            <NuxtLink to="/my/subscriptions" class="flex-1 text-center border border-gray-200 py-4 rounded-xl font-semibold text-slate-600 hover:border-navy hover:text-navy">
              View My Subscriptions
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
