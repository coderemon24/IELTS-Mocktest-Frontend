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

const exam = ref<ListeningExam | null>(null)
const isLoading = ref(true)
const errorMessage = ref<string | null>(null)

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

onMounted(fetchExam)
</script>

<template>
  <div class="min-h-[calc(100vh-80px)] bg-offwhite">
    <div class="container mx-auto px-4 py-12">
      <div class="max-w-4xl mx-auto space-y-6">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-bold uppercase tracking-widest text-orange">Listening</p>
            <h1 class="text-3xl font-bold text-navy">Exam Instructions</h1>
          </div>
          <NuxtLink to="/exam/listening" class="text-sm font-semibold text-slate-500 hover:text-navy">Back to exams</NuxtLink>
        </div>

        <div v-if="errorMessage" class="bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl p-4 text-sm">
          {{ errorMessage }}
        </div>

        <div v-else-if="isLoading" class="bg-white rounded-3xl border border-gray-100 p-8 text-slate-500">Loading instructions...</div>

        <div v-else-if="exam" class="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p class="text-xs text-slate-400">Listening Exam</p>
              <h2 class="text-2xl font-bold text-navy">{{ exam.title }}</h2>
            </div>
            <div class="flex gap-2">
              <span class="text-xs font-bold px-3 py-2 rounded-full bg-blue-100 text-blue-700">{{ exam.duration || 40 }} mins</span>
              <span class="text-xs font-bold px-3 py-2 rounded-full bg-slate-100 text-slate-600">{{ exam.sections_count ?? 0 }} sections</span>
              <span class="text-xs font-bold px-3 py-2 rounded-full bg-slate-100 text-slate-600">{{ exam.questions_count ?? 0 }} questions</span>
            </div>
          </div>

          <div class="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600 leading-relaxed">
            <p v-if="exam.instruction">{{ exam.instruction }}</p>
            <p v-else>Read each section carefully. You will hear audio once only. Answer all questions.</p>
          </div>

          <div class="mt-8 flex flex-col sm:flex-row gap-3">
            <NuxtLink :to="`/exam/listening/${exam.unique_id || exam.id}/start`" class="flex-1 text-center bg-navy text-white font-bold py-4 rounded-xl hover:bg-navy-light transition">
              Start Exam
            </NuxtLink>
            <NuxtLink to="/exam/listening" class="flex-1 text-center border border-gray-200 py-4 rounded-xl font-semibold text-slate-600 hover:border-navy hover:text-navy">
              Choose another exam
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
