<script setup lang="ts">
definePageMeta({
  middleware: 'user-auth',
})

type Question = {
  id: number | string
  question_type?: string
  question_text?: string
  order_index?: number
}

type Section = {
  id: number | string
  title?: string
  instruction?: string
  audio?: string | null
  order_index?: number
  questions?: Question[]
  questions_count?: number
}

type ListeningExam = {
  id: number | string
  unique_id?: string
  title: string
  instruction?: string
  duration?: number | string | null
  sections?: Section[]
  sections_count?: number
  questions_count?: number
}

const { $axios } = useNuxtApp()
const route = useRoute()

const exam = ref<ListeningExam | null>(null)
const isLoading = ref(true)
const errorMessage = ref<string | null>(null)
const expanded = ref<Record<string, boolean>>({})

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

const toggleSection = (id: string | number) => {
  const key = String(id)
  expanded.value[key] = !expanded.value[key]
}

const audioUrl = (path?: string | null) => {
  if (!path) return null
  if (path.startsWith('http')) return path
  return `${path}`
}

onMounted(fetchExam)
</script>

<template>
  <div class="min-h-[calc(100vh-80px)] bg-offwhite">
    <div class="container mx-auto px-4 py-12">
      <div class="max-w-5xl mx-auto space-y-8">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-xs font-bold uppercase tracking-widest text-orange">Listening</p>
            <h1 class="text-3xl font-bold text-navy">{{ exam?.title || 'Listening Exam' }}</h1>
            <p class="text-sm text-slate-500">Complete all sections. Answers are saved locally.</p>
          </div>
          <NuxtLink to="/exam/listening" class="text-sm font-semibold text-slate-500 hover:text-navy">Back to exams</NuxtLink>
        </div>

        <div v-if="errorMessage" class="bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl p-4 text-sm">
          {{ errorMessage }}
        </div>

        <div v-else-if="isLoading" class="bg-white rounded-3xl border border-gray-100 p-8 text-slate-500">Loading exam...</div>

        <div v-else-if="exam" class="space-y-6">
          <div class="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
            <div class="flex flex-wrap gap-2 text-xs font-bold">
              <span class="px-3 py-2 rounded-full bg-blue-100 text-blue-700">{{ exam.duration || 40 }} mins</span>
              <span class="px-3 py-2 rounded-full bg-slate-100 text-slate-600">{{ exam.sections_count ?? exam.sections?.length ?? 0 }} sections</span>
              <span class="px-3 py-2 rounded-full bg-slate-100 text-slate-600">{{ exam.questions_count ?? 0 }} questions</span>
            </div>
            <p v-if="exam.instruction" class="mt-4 text-sm text-slate-600">{{ exam.instruction }}</p>
          </div>

          <div class="space-y-4">
            <div v-for="section in exam.sections || []" :key="section.id" class="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
              <div class="flex items-start justify-between gap-4">
                <div>
                  <p class="text-xs text-slate-400">Section {{ section.order_index ?? '' }}</p>
                  <h3 class="text-lg font-bold text-navy">{{ section.title || 'Section' }}</h3>
                  <p v-if="section.instruction" class="text-sm text-slate-500 mt-2">{{ section.instruction }}</p>
                </div>
                <button class="text-sm font-semibold text-navy" @click="toggleSection(section.id)">
                  {{ expanded[String(section.id)] ? 'Hide' : 'View' }} questions
                </button>
              </div>

              <div v-if="audioUrl(section.audio)" class="mt-4">
                <audio controls class="w-full">
                  <source :src="audioUrl(section.audio)" />
                </audio>
              </div>

              <div v-if="expanded[String(section.id)]" class="mt-6 space-y-3">
                <div v-for="question in section.questions || []" :key="question.id" class="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <p class="text-sm text-slate-700">
                    <span class="font-semibold text-navy">Q{{ question.order_index ?? '' }}.</span>
                    {{ question.question_text || 'Question text not available.' }}
                  </p>
                </div>
                <p v-if="(section.questions || []).length === 0" class="text-sm text-slate-400">No questions available.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
