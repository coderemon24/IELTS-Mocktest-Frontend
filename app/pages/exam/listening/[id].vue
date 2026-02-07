<script setup lang="ts">
definePageMeta({
  middleware: 'user-auth',
})

type ListeningExam = {
  id: number | string
  unique_id?: string
  title: string
  instruction?: string
  duration?: number | string | null
  sections_count?: number
  questions_count?: number
}

const { $axios } = useNuxtApp()
const route = useRoute()
const {
  hasActiveSubscription,
  activeSubscription,
  isCheckingSubscription,
  refreshSubscription,
} = useSubscriptionAccess()

const exam = ref<ListeningExam | null>(null)
const isLoading = ref(true)
const errorMessage = ref<string | null>(null)
const isReady = computed(() => !isLoading.value && !isCheckingSubscription.value)

const fetchExam = async () => {
  isLoading.value = true
  errorMessage.value = null
  try {
    const response = await $axios.get(`/listening-exams/${route.params.id}`)
    exam.value = response?.data?.data || null
  } catch (e: any) {
    errorMessage.value =
      e?.response?.data?.data?.message ||
      e?.response?.data?.message ||
      e?.message ||
      'Failed to load exam.'
  } finally {
    isLoading.value = false
  }
}

onMounted(async () => {
  await Promise.all([fetchExam(), refreshSubscription()])
})
</script>

<template>
  <div class="min-h-[calc(100vh-80px)] bg-[radial-gradient(circle_at_20%_10%,#dbeafe_0%,#f8fafc_35%,#f8fafc_100%)]">
    <div class="container mx-auto px-4 py-12 lg:py-16">
      <div class="max-w-5xl mx-auto space-y-6">
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="text-xs font-bold uppercase tracking-widest text-cyan-700">Listening</p>
            <h1 class="text-3xl font-black text-slate-900">Exam Instructions</h1>
          </div>
          <NuxtLink to="/exam/listening" class="text-sm font-semibold text-slate-500 hover:text-slate-900">Back to exams</NuxtLink>
        </div>

        <div v-if="errorMessage" class="bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl p-4 text-sm">
          {{ errorMessage }}
        </div>

        <div v-else-if="!isReady" class="bg-white rounded-3xl border border-gray-100 p-8 text-slate-500">
          Loading instructions...
        </div>

        <div v-else-if="exam" class="relative overflow-hidden bg-white rounded-[2rem] border border-slate-200 p-8 shadow-[0_20px_70px_-40px_rgba(15,23,42,.45)]">
          <div class="absolute -right-10 -top-10 w-44 h-44 rounded-full bg-cyan-100/60 blur-2xl"></div>
          <div class="absolute -left-10 -bottom-10 w-44 h-44 rounded-full bg-blue-100/50 blur-2xl"></div>

          <div class="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p class="text-xs text-slate-400">Listening Exam</p>
              <h2 class="text-2xl font-black text-slate-900">{{ exam.title }}</h2>
            </div>
            <div class="flex gap-2">
              <span class="text-xs font-bold px-3 py-2 rounded-full bg-cyan-100 text-cyan-800">{{ exam.duration || 40 }} mins</span>
              <span class="text-xs font-bold px-3 py-2 rounded-full bg-slate-100 text-slate-700">{{ exam.sections_count ?? 0 }} sections</span>
              <span class="text-xs font-bold px-3 py-2 rounded-full bg-slate-100 text-slate-700">{{ exam.questions_count ?? 0 }} questions</span>
            </div>
          </div>

          <div class="relative mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <p class="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Please Read Before You Start
            </p>
            <div
              v-if="exam.instruction"
              class="prose prose-sm max-w-none text-slate-700"
              v-html="exam.instruction"
            ></div>
            <p v-else class="text-sm text-slate-700 leading-relaxed">
              Read each section carefully. You will hear audio once only. Answer all questions.
            </p>
          </div>

          <div
            v-if="!hasActiveSubscription"
            class="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"
          >
            <p class="font-bold">Subscription Required</p>
            <p class="mt-1">
              You need an active subscription to start this test. Buy a plan to unlock full listening exams.
            </p>
          </div>

          <div
            v-else-if="activeSubscription?.plan?.name"
            class="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          >
            Active plan detected: <span class="font-bold">{{ activeSubscription.plan.name }}</span>
          </div>

          <div class="mt-8 flex flex-col sm:flex-row gap-3">
            <NuxtLink
              v-if="hasActiveSubscription"
              :to="`/exam/listening/${exam.unique_id || exam.id}/start`"
              class="flex-1 text-center bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-700 transition"
            >
              Start Your Test
            </NuxtLink>
            <NuxtLink
              v-else
              to="/pricing-plans"
              class="flex-1 text-center bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-4 rounded-xl hover:opacity-95 transition"
            >
              Buy Subscription First
            </NuxtLink>
            <NuxtLink to="/exam/listening" class="flex-1 text-center border border-gray-200 py-4 rounded-xl font-semibold text-slate-600 hover:border-slate-900 hover:text-slate-900">
              Choose another exam
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
