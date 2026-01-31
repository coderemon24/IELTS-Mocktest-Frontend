<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue'

import type { ListeningExam } from '@/composables/useAdminListeningExams'
import {
  adminListeningExamsEndpoint,
  useAdminListeningExams,
} from '@/composables/useAdminListeningExams'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

const query = ref('')
const showCreate = ref(false)
const isSaving = ref(false)
const saveError = ref<string | null>(null)
const deletingId = ref<string | null>(null)

const fieldErrors = reactive<Record<string, string[]>>({})
const clearFieldErrors = () => {
  for (const key of Object.keys(fieldErrors)) delete fieldErrors[key]
}
const fieldError = (key: string) => fieldErrors[key]?.[0] ?? null
const hasFieldError = (key: string) => !!fieldError(key)

const keySection = (sectionIndex: number, field: string) =>
  `sections.${sectionIndex}.${field}`
const keyQuestion = (sectionIndex: number, questionIndex: number, field: string) =>
  `sections.${sectionIndex}.questions.${questionIndex}.${field}`

const emptyExam = (): ListeningExam => ({
  title: '',
  instruction: null,
  duration: null,
  status: 'active',
  sections: [],
})

const draft = reactive<ListeningExam>(emptyExam())

const resetDraft = () => {
  Object.assign(draft, emptyExam())
}

const addSection = () => {
  draft.sections = draft.sections ?? []
  draft.sections.push({
    title: '',
    instruction: null,
    audio: null,
    order_index: (draft.sections.length ?? 0) + 1,
    status: 'active',
    questions: [],
  })
}

const removeSection = (idx: number) => {
  draft.sections?.splice(idx, 1)
}

const addQuestion = (sectionIndex: number) => {
  const section = draft.sections?.[sectionIndex]
  if (!section) return
  section.questions = section.questions ?? []
  section.questions.push({
    question_type: 'fill_blank',
    question_text: 'Type your question with {blank} here',
    correct_answer: '',
    order_index: (section.questions.length ?? 0) + 1,
  })
}

const removeQuestion = (sectionIndex: number, questionIndex: number) => {
  const section = draft.sections?.[sectionIndex]
  if (!section?.questions) return
  section.questions.splice(questionIndex, 1)
}

const { exams, pending, error, refresh, endpoint, actions } =
  useAdminListeningExams()

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return exams.value
  return exams.value.filter((e) => {
    const sectionCount = e.sections?.length ?? 0
    const questionCount =
      e.sections?.reduce((sum, s) => sum + (s.questions?.length ?? 0), 0) ?? 0
    const hay = [
      e.title,
      e.instruction,
      String(e.duration ?? ''),
      String(e.status ?? ''),
      String(sectionCount),
      String(questionCount),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return hay.includes(q)
  })
})

const openCreate = () => {
  resetDraft()
  saveError.value = null
  clearFieldErrors()
  showCreate.value = true
}

const closeCreate = () => {
  showCreate.value = false
}

const validateDraft = () => {
  clearFieldErrors()

  if (!draft.title?.trim()) fieldErrors.title = ['Title is required.']
  if (draft.duration != null && Number(draft.duration) < 1) {
    fieldErrors.duration = ['Duration must be at least 1.']
  }

  for (const [sIndex, s] of (draft.sections ?? []).entries()) {
    const sectionTitleKey = keySection(sIndex, 'title')
    if (!s.title?.trim()) fieldErrors[sectionTitleKey] = ['Section title is required.']

    const sectionOrderKey = keySection(sIndex, 'order_index')
    if (s.order_index != null && Number(s.order_index) < 1) {
      fieldErrors[sectionOrderKey] = ['Order must be at least 1.']
    }

    for (const [qIndex, q] of (s.questions ?? []).entries()) {
      const qTextKey = keyQuestion(sIndex, qIndex, 'question_text')
      if (!q.question_text?.includes('{blank}')) {
        fieldErrors[qTextKey] = ['Question text must include {blank}.']
      }

      const qAnswerKey = keyQuestion(sIndex, qIndex, 'correct_answer')
      if (!q.correct_answer?.trim()) {
        fieldErrors[qAnswerKey] = ['Correct answer is required.']
      }

      const qOrderKey = keyQuestion(sIndex, qIndex, 'order_index')
      if (q.order_index != null && Number(q.order_index) < 1) {
        fieldErrors[qOrderKey] = ['Order must be at least 1.']
      }
    }
  }

  return Object.keys(fieldErrors).length === 0
}

const save = async () => {
  saveError.value = null
  clearFieldErrors()
  if (!validateDraft()) return

  isSaving.value = true
  try {
    await actions.createExam(draft)
    closeCreate()
    await refresh()
  } catch (e: any) {
    const serverErrors = e?.response?.data?.errors
    if (serverErrors && typeof serverErrors === 'object') {
      for (const [key, value] of Object.entries(serverErrors)) {
        if (Array.isArray(value)) fieldErrors[String(key)] = value as string[]
      }
    }

    if (Object.keys(fieldErrors).length === 0) {
      saveError.value =
        e?.response?.data?.message ||
        e?.message ||
        'Failed to create listening exam.'
    }
  } finally {
    isSaving.value = false
  }
}

const deleteExam = async (exam: ListeningExam) => {
  const examId = exam.unique_id
  if (!examId) {
    alert('Missing unique_id for this exam.')
    return
  }
  const ok = confirm(`Delete "${exam.title}"?`)
  if (!ok) return

  deletingId.value = examId
  try {
    await actions.deleteExam(examId)
    await refresh()
  } catch (e: any) {
    alert(e?.response?.data?.message || e?.message || 'Failed to delete exam.')
  } finally {
    deletingId.value = null
  }
}

const setBodyScrollLocked = (locked: boolean) => {
  document.body.style.overflow = locked ? 'hidden' : ''
}

watch(showCreate, (v) => setBodyScrollLocked(v))

const onKeyDown = (e: KeyboardEvent) => {
  if (!showCreate.value) return
  if (e.key === 'Escape' && !isSaving.value) closeCreate()
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
  setBodyScrollLocked(false)
})
</script>

<template>
  <div class="space-y-6">
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800"
    >
      <div>
        <h1 class="text-xl font-bold text-navy dark:text-white">
          Listening Exams
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Manage listening exams with sections and questions.
        </p>
      </div>
      <div class="flex gap-2">
        <NuxtLink
          to="/admin/exams/listening/sections"
          class="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
        >
          View Sections
        </NuxtLink>
        <NuxtLink
          to="/admin/exams/listening/questions"
          class="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
        >
          View Questions
        </NuxtLink>
        <button
          class="px-4 py-2 text-xs font-bold text-white bg-navy rounded-lg shadow-md shadow-navy/20 hover:bg-navy-light transition"
          @click="openCreate"
        >
          + New Listening Exam
        </button>
      </div>
    </div>

    <div
      v-if="error"
      class="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 text-sm"
    >
      Failed to load from API. Check `runtimeConfig.public.apiBase` and backend
      route `GET {{ endpoint }}`.
    </div>

    <div
      class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden"
    >
      <div
        class="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
      >
        <div class="flex items-center gap-2">
          <p class="text-sm font-bold text-navy dark:text-white">Exams</p>
          <span
            class="text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500"
          >
            {{ filtered.length }}
          </span>
        </div>
        <div class="flex gap-2 w-full sm:w-auto">
          <input
            v-model="query"
            type="text"
            placeholder="Search exams..."
            class="w-full sm:w-80 px-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40"
          />
          <button
            class="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition shrink-0"
            @click="refresh"
          >
            Refresh
          </button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr
              class="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 font-bold uppercase tracking-wider"
            >
              <th class="px-6 py-3">Title</th>
              <th class="px-6 py-3">Duration</th>
              <th class="px-6 py-3">Status</th>
              <th class="px-6 py-3 text-right">Sections</th>
              <th class="px-6 py-3 text-right">Questions</th>
              <th class="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr
              v-for="(e, idx) in filtered"
              :key="String(e.id ?? e.unique_id ?? idx)"
              class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
            >
              <td class="px-6 py-4">
                <p class="font-bold text-navy dark:text-white">{{ e.title }}</p>
                <p
                  v-if="e.instruction"
                  class="text-[11px] text-slate-400 line-clamp-2"
                >
                  {{ e.instruction }}
                </p>
              </td>
              <td class="px-6 py-4 text-slate-600 dark:text-slate-300">
                {{ e.duration ?? '—' }}
              </td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    'text-[10px] font-bold px-2 py-1 rounded-full',
                    (e.status ?? 'active') === 'active'
                      ? 'bg-mint/15 text-mint'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500',
                  ]"
                >
                  {{ e.status ?? 'active' }}
                </span>
              </td>
              <td
                class="px-6 py-4 text-right font-bold text-slate-600 dark:text-slate-300"
              >
                {{ e.sections?.length ?? 0 }}
              </td>
              <td
                class="px-6 py-4 text-right font-bold text-slate-600 dark:text-slate-300"
              >
                {{
                  e.sections?.reduce(
                    (sum, s) => sum + (s.questions?.length ?? 0),
                    0,
                  ) ?? 0
                }}
              </td>
              <td class="px-6 py-4 text-right">
                <button
                  class="text-rose-600 hover:text-rose-700 text-xs font-bold disabled:opacity-60"
                  :disabled="deletingId === (e.unique_id ?? null)"
                  @click="deleteExam(e)"
                >
                  {{ deletingId === (e.unique_id ?? null) ? 'Deleting...' : 'Delete' }}
                </button>
              </td>
            </tr>

            <tr v-if="!pending && filtered.length === 0">
              <td
                class="px-6 py-10 text-center text-slate-500 dark:text-slate-400"
                colspan="6"
              >
                No listening exams found.
              </td>
            </tr>

            <tr v-if="pending">
              <td
                class="px-6 py-10 text-center text-slate-500 dark:text-slate-400"
                colspan="6"
              >
                Loading...
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-if="showCreate"
        class="fixed inset-0 z-[9999] flex items-start justify-center p-4 sm:p-8"
      >
      <div
        class="absolute inset-0 bg-black/50"
        @click="!isSaving && closeCreate()"
      ></div>

      <div
        class="relative w-[min(1000px,calc(100vw-2rem))] max-h-[calc(100dvh-4rem)] overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-2xl"
        @click.stop
      >
        <div
          class="sticky top-0 z-10 p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900"
        >
          <div>
            <h2 class="text-lg font-bold text-navy dark:text-white">
              New Listening Exam
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Payload matches your backend validation (exam → sections → questions).
            </p>
          </div>
          <button
            class="p-2 rounded-lg text-slate-400 hover:text-navy hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-white disabled:opacity-50 disabled:pointer-events-none"
            :disabled="isSaving"
            type="button"
            aria-label="Close modal"
            title="Close"
            @click="closeCreate()"
          >
            <Icon name="heroicons:x-mark" class="w-5 h-5" />
          </button>
        </div>

        <div class="p-5 space-y-6 overflow-y-auto max-h-[calc(100dvh-10rem)]">
          <div
            v-if="saveError"
            class="bg-rose-50 border border-rose-200 text-rose-900 rounded-xl p-4 text-sm"
          >
            {{ saveError }}
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                >Title *</label
              >
              <input
                v-model="draft.title"
                type="text"
                :class="[
                  'w-full px-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40',
                  hasFieldError('title') &&
                    'border-rose-500 dark:border-rose-500 focus:ring-rose-400',
                ]"
                placeholder="e.g. IELTS Listening Mock Test 01"
              />
              <p v-if="fieldError('title')" class="mt-1 text-xs text-rose-600">
                {{ fieldError('title') }}
              </p>
            </div>
            <div>
              <label
                class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                >Duration (minutes)</label
              >
              <input
                v-model.number="draft.duration"
                type="number"
                min="1"
                :class="[
                  'w-full px-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40',
                  hasFieldError('duration') &&
                    'border-rose-500 dark:border-rose-500 focus:ring-rose-400',
                ]"
                placeholder="e.g. 30"
              />
              <p
                v-if="fieldError('duration')"
                class="mt-1 text-xs text-rose-600"
              >
                {{ fieldError('duration') }}
              </p>
            </div>
            <div class="md:col-span-2">
              <label
                class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                >Instruction</label
              >
              <textarea
                v-model="draft.instruction"
                rows="3"
                :class="[
                  'w-full px-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40',
                  hasFieldError('instruction') &&
                    'border-rose-500 dark:border-rose-500 focus:ring-rose-400',
                ]"
                placeholder="Optional instructions for this exam..."
              ></textarea>
              <p
                v-if="fieldError('instruction')"
                class="mt-1 text-xs text-rose-600"
              >
                {{ fieldError('instruction') }}
              </p>
            </div>
            <div>
              <label
                class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                >Status</label
              >
              <select
                v-model="draft.status"
                class="w-full px-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40"
              >
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </div>
          </div>

          <div class="flex items-center justify-between">
            <h3 class="text-sm font-bold text-navy dark:text-white">Sections</h3>
            <button
              class="px-4 py-2 text-xs font-bold text-white bg-navy rounded-lg shadow-md shadow-navy/20 hover:bg-navy-light transition"
              @click="addSection"
            >
              + Add Section
            </button>
          </div>

          <div
            v-if="(draft.sections?.length ?? 0) === 0"
            class="text-sm text-slate-500 dark:text-slate-400"
          >
            No sections yet.
          </div>

          <div
            v-for="(s, sIdx) in draft.sections"
            :key="sIdx"
            class="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden"
          >
            <div
              class="p-4 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between"
            >
              <p class="text-sm font-bold text-navy dark:text-white">
                Section {{ sIdx + 1 }}
              </p>
              <button
                class="text-rose-600 hover:text-rose-700 text-xs font-bold"
                @click="removeSection(sIdx)"
              >
                Remove
              </button>
            </div>

            <div class="p-4 space-y-4">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                    >Title *</label
                  >
                  <input
                    v-model="s.title"
                    type="text"
                    :class="[
                      'w-full px-4 py-2 text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40',
                      hasFieldError(keySection(sIdx, 'title')) &&
                        'border-rose-500 dark:border-rose-500 focus:ring-rose-400',
                    ]"
                    placeholder="e.g. Section 1"
                  />
                  <p
                    v-if="fieldError(keySection(sIdx, 'title'))"
                    class="mt-1 text-xs text-rose-600"
                  >
                    {{ fieldError(keySection(sIdx, 'title')) }}
                  </p>
                </div>
                <div>
                  <label
                    class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                    >Audio (URL/path)</label
                  >
                  <input
                    v-model="s.audio"
                    type="text"
                    class="w-full px-4 py-2 text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label
                    class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                    >Order</label
                  >
                  <input
                    v-model.number="s.order_index"
                    type="number"
                    min="1"
                    :class="[
                      'w-full px-4 py-2 text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40',
                      hasFieldError(keySection(sIdx, 'order_index')) &&
                        'border-rose-500 dark:border-rose-500 focus:ring-rose-400',
                    ]"
                  />
                  <p
                    v-if="fieldError(keySection(sIdx, 'order_index'))"
                    class="mt-1 text-xs text-rose-600"
                  >
                    {{ fieldError(keySection(sIdx, 'order_index')) }}
                  </p>
                </div>
                <div>
                  <label
                    class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                    >Status</label
                  >
                  <select
                    v-model="s.status"
                    class="w-full px-4 py-2 text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40"
                  >
                    <option value="active">active</option>
                    <option value="inactive">inactive</option>
                  </select>
                </div>
                <div class="md:col-span-2">
                  <label
                    class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                    >Instruction</label
                  >
                  <textarea
                    v-model="s.instruction"
                    rows="2"
                    class="w-full px-4 py-2 text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40"
                    placeholder="Optional section instruction..."
                  ></textarea>
                </div>
              </div>

              <div class="flex items-center justify-between">
                <h4 class="text-sm font-bold text-navy dark:text-white">
                  Questions
                </h4>
                <button
                  class="px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  @click="addQuestion(sIdx)"
                >
                  + Add Question
                </button>
              </div>

              <div
                v-if="(s.questions?.length ?? 0) === 0"
                class="text-sm text-slate-500 dark:text-slate-400"
              >
                No questions yet.
              </div>

              <div
                v-for="(q, qIdx) in s.questions"
                :key="qIdx"
                class="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3"
              >
                <div class="flex items-center justify-between">
                  <p
                    class="text-xs font-bold text-slate-500 uppercase tracking-wider"
                  >
                    Question {{ qIdx + 1 }}
                  </p>
                  <button
                    class="text-rose-600 hover:text-rose-700 text-xs font-bold"
                    @click="removeQuestion(sIdx, qIdx)"
                  >
                    Remove
                  </button>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label
                      class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                      >Type</label
                    >
                    <select
                      v-model="q.question_type"
                      class="w-full px-4 py-2 text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40"
                    >
                      <option value="fill_blank">fill_blank</option>
                    </select>
                  </div>
                  <div>
                    <label
                      class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                      >Order</label
                    >
                    <input
                      v-model.number="q.order_index"
                      type="number"
                      min="1"
                      :class="[
                        'w-full px-4 py-2 text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40',
                        hasFieldError(keyQuestion(sIdx, qIdx, 'order_index')) &&
                          'border-rose-500 dark:border-rose-500 focus:ring-rose-400',
                      ]"
                    />
                    <p
                      v-if="fieldError(keyQuestion(sIdx, qIdx, 'order_index'))"
                      class="mt-1 text-xs text-rose-600"
                    >
                      {{ fieldError(keyQuestion(sIdx, qIdx, 'order_index')) }}
                    </p>
                  </div>
                  <div>
                    <label
                      class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                      >Correct Answer *</label
                    >
                    <input
                      v-model="q.correct_answer"
                      type="text"
                      :class="[
                        'w-full px-4 py-2 text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40',
                        hasFieldError(keyQuestion(sIdx, qIdx, 'correct_answer')) &&
                          'border-rose-500 dark:border-rose-500 focus:ring-rose-400',
                      ]"
                      placeholder="e.g. library"
                    />
                    <p
                      v-if="fieldError(keyQuestion(sIdx, qIdx, 'correct_answer'))"
                      class="mt-1 text-xs text-rose-600"
                    >
                      {{ fieldError(keyQuestion(sIdx, qIdx, 'correct_answer')) }}
                    </p>
                  </div>
                  <div class="md:col-span-3">
                    <label
                      class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                      >Question Text *</label
                    >
                    <textarea
                      v-model="q.question_text"
                      rows="2"
                      :class="[
                        'w-full px-4 py-2 text-sm rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40',
                        hasFieldError(keyQuestion(sIdx, qIdx, 'question_text')) &&
                          'border-rose-500 dark:border-rose-500 focus:ring-rose-400',
                      ]"
                      placeholder="Must include {blank}"
                    ></textarea>
                    <p
                      v-if="fieldError(keyQuestion(sIdx, qIdx, 'question_text'))"
                      class="mt-1 text-xs text-rose-600"
                    >
                      {{ fieldError(keyQuestion(sIdx, qIdx, 'question_text')) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            v-if="isSaving"
            class="absolute inset-0 z-20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3"
          >
            <div
              class="w-10 h-10 rounded-full border-4 border-navy/20 border-t-navy dark:border-white/20 dark:border-t-white animate-spin"
            ></div>
            <p class="text-sm font-bold text-navy dark:text-white">Saving...</p>
          </div>

          <div
            class="sticky bottom-0 z-10 -mx-5 px-5 py-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2"
          >
            <button
              class="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              @click="closeCreate"
              :disabled="isSaving"
            >
              Cancel
            </button>
            <button
              class="px-4 py-2 text-xs font-bold text-white bg-navy rounded-lg shadow-md shadow-navy/20 hover:bg-navy-light transition disabled:opacity-60"
              @click="save"
              :disabled="isSaving"
            >
              <span class="inline-flex items-center gap-2">
                <span
                  v-if="isSaving"
                  class="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin"
                ></span>
                {{ isSaving ? 'Saving...' : 'Save' }}
              </span>
            </button>
          </div>

          <p class="text-[11px] text-slate-400">
            API endpoint used:
            <span class="font-mono">{{ adminListeningExamsEndpoint }}</span>
          </p>
        </div>
      </div>
    </div>
    </Teleport>
  </div>
</template>
