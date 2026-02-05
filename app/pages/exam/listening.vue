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

const exams = ref<ListeningExam[]>([])
const isLoading = ref(true)
const errorMessage = ref<string | null>(null)

const fetchExams = async () => {
  isLoading.value = true
  errorMessage.value = null
  try {
    const response = await $axios.get('/listening-exams')
    exams.value = response?.data?.data || []
  } catch (e: any) {
    errorMessage.value =
      e?.response?.data?.message || e?.message || 'Failed to load listening exams.'
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchExams)
</script>

<template>
  <div class="min-h-[calc(100vh-80px)] bg-offwhite">
    <div class="container mx-auto px-4 py-12">
      <div class="max-w-6xl mx-auto space-y-8">
        <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p class="text-xs font-bold uppercase tracking-widest text-orange">Listening</p>
            <h1 class="text-3xl font-bold text-navy">Listening Mock Tests</h1>
            <p class="text-sm text-slate-500">Choose a test to see instructions before starting.</p>
          </div>
          <NuxtLink to="/dashboard" class="px-4 py-2 text-sm font-semibold text-navy border border-gray-200 rounded-xl hover:border-navy hover:bg-slate-50 transition">Back to Dashboard</NuxtLink>
        </div>

        <div v-if="errorMessage" class="bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl p-4 text-sm">
          {{ errorMessage }}
        </div>

        <div v-else>
          <div v-if="isLoading" class="bg-white rounded-3xl border border-gray-100 p-8 text-slate-500">Loading listening exams...</div>

          <div v-else-if="exams.length === 0" class="bg-white rounded-3xl border border-gray-100 p-8 text-center">
            <p class="text-slate-500">No listening exams available.</p>
          </div>

          <div v-else class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="exam in exams" :key="String(exam.id || exam.unique_id)" class="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-lg transition">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-xs text-slate-400">Listening Exam</p>
                  <h3 class="text-lg font-bold text-navy">{{ exam.title }}</h3>
                </div>
                <span class="text-xs font-bold px-2 py-1 rounded-full bg-blue-100 text-blue-700">{{ exam.duration || 40 }} mins</span>
              </div>

              <div class="mt-4 grid grid-cols-2 gap-4">
                <div class="rounded-xl bg-slate-50 p-3">
                  <p class="text-xs text-slate-400">Sections</p>
                  <p class="text-sm font-bold text-navy">{{ exam.sections_count ?? 0 }}</p>
                </div>
                <div class="rounded-xl bg-slate-50 p-3">
                  <p class="text-xs text-slate-400">Questions</p>
                  <p class="text-sm font-bold text-navy">{{ exam.questions_count ?? 0 }}</p>
                </div>
              </div>

              <div class="mt-5">
                <NuxtLink :to="`/exam/listening/${exam.unique_id || exam.id}`" class="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-navy rounded-xl hover:bg-navy-light transition">
                  View Instructions
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
