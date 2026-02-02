<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

const query = ref('')
const { questions, pending, error, refresh, endpoint, actions } = useAdminListeningExams()
const showEdit = ref(false)
const isUpdating = ref(false)
const editError = ref<string | null>(null)
const editingQuestionId = ref<string | null>(null)
const editFieldErrors = reactive<Record<string, string[]>>({})

const clearEditFieldErrors = () => {
  for (const key of Object.keys(editFieldErrors)) delete editFieldErrors[key]
}
const editFieldError = (key: string) => editFieldErrors[key]?.[0] ?? null
const hasEditFieldError = (key: string) => !!editFieldError(key)

const editDraft = reactive({
  question_type: 'fill_blank' as string | null,
  question_text: '',
  correct_answer: '',
  order_index: null as number | null,
  _examTitle: null as string | null,
  _sectionTitle: null as string | null,
})

const resetEditDraft = () => {
  editDraft.question_type = 'fill_blank'
  editDraft.question_text = ''
  editDraft.correct_answer = ''
  editDraft.order_index = null
  editDraft._examTitle = null
  editDraft._sectionTitle = null
}

const openEdit = (question: any) => {
  const questionId = question.id ?? question.unique_id
  if (!questionId) {
    alert('Missing id for this question.')
    return
  }
  resetEditDraft()
  editDraft.question_type = question.question_type ?? 'fill_blank'
  editDraft.question_text =
    question.question_text ?? question.question ?? question.text ?? ''
  editDraft.correct_answer = question.correct_answer ?? ''
  editDraft.order_index = question.order_index ?? null
  editDraft._examTitle = question.exam?.title ?? null
  editDraft._sectionTitle = question.section?.title ?? null
  editingQuestionId.value = String(questionId)
  editError.value = null
  clearEditFieldErrors()
  showEdit.value = true
}

const closeEdit = () => {
  showEdit.value = false
}

const validateEditDraft = () => {
  clearEditFieldErrors()
  if (!editDraft.question_text?.includes('{blank}')) {
    editFieldErrors.question_text = ['Question text must include {blank}.']
  }
  if (!editDraft.correct_answer?.trim()) {
    editFieldErrors.correct_answer = ['Correct answer is required.']
  }
  if (editDraft.order_index != null && Number(editDraft.order_index) < 1) {
    editFieldErrors.order_index = ['Order must be at least 1.']
  }
  return Object.keys(editFieldErrors).length === 0
}

const updateQuestion = async () => {
  editError.value = null
  clearEditFieldErrors()
  if (!validateEditDraft()) return
  if (!editingQuestionId.value) {
    editError.value = 'Missing question identifier.'
    return
  }

  isUpdating.value = true
  try {
    const payload = {
      question_type: editDraft.question_type,
      question_text: editDraft.question_text,
      correct_answer: editDraft.correct_answer,
      order_index: editDraft.order_index,
    }
    await actions.updateQuestion(editingQuestionId.value, payload)
    closeEdit()
    await refresh()
  } catch (e: any) {
    const serverErrors = e?.response?.data?.errors
    if (serverErrors && typeof serverErrors === 'object') {
      for (const [key, value] of Object.entries(serverErrors)) {
        if (Array.isArray(value)) editFieldErrors[String(key)] = value as string[]
      }
    }

    if (Object.keys(editFieldErrors).length === 0) {
      editError.value =
        e?.response?.data?.message || e?.message || 'Failed to update question.'
    }
  } finally {
    isUpdating.value = false
  }
}

const setBodyScrollLocked = (locked: boolean) => {
  document.body.style.overflow = locked ? 'hidden' : ''
}

watch(showEdit, (v) => setBodyScrollLocked(v))

const onKeyDown = (e: KeyboardEvent) => {
  if (!showEdit.value) return
  if (e.key === 'Escape' && !isUpdating.value) closeEdit()
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
  setBodyScrollLocked(false)
})

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return questions.value
  return questions.value.filter((x) => {
    const hay = [
      x.exam?.title,
      x.section?.title,
      x.question_type,
      x.question_text,
      x.correct_answer,
      String(x.order_index ?? ''),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return hay.includes(q)
  })
})
</script>

<template>
  <div class="space-y-6">
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800"
    >
      <div>
        <h1 class="text-xl font-bold text-navy dark:text-white">
          Listening Questions
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
          All questions across listening exam sections.
        </p>
      </div>
      <div class="flex gap-2">
        <button
          class="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
          @click="refresh"
        >
          Refresh
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
          <p class="text-sm font-bold text-navy dark:text-white">Questions</p>
          <span
            class="text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500"
          >
            {{ filtered.length }}
          </span>
        </div>
        <input
          v-model="query"
          type="text"
          placeholder="Search questions..."
          class="w-full sm:w-80 px-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40"
        />
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr
              class="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 font-bold uppercase tracking-wider"
            >
              <th class="px-6 py-3">Exam</th>
              <th class="px-6 py-3">Section</th>
              <th class="px-6 py-3">Type</th>
              <th class="px-6 py-3">Question</th>
              <th class="px-6 py-3">Answer</th>
              <th class="px-6 py-3 text-right">Order</th>
              <th class="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr
              v-for="(q, idx) in filtered"
              :key="String(q.id ?? idx)"
              class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
            >
              <td class="px-6 py-4 font-bold text-navy dark:text-white">
                {{ q.exam?.title || '—' }}
              </td>
              <td class="px-6 py-4 text-slate-600 dark:text-slate-300">
                {{ q.section?.title || '—' }}
              </td>
              <td class="px-6 py-4">
                <span
                  class="text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500"
                >
                  {{ q.question_type ?? '—' }}
                </span>
              </td>
              <td class="px-6 py-4">
                <p class="text-slate-700 dark:text-slate-200 line-clamp-2">
                  {{ q.question_text }}
                </p>
                <p
                  v-if="q.question_text && !q.question_text.includes('{blank}')"
                  class="text-[11px] text-amber-600 mt-1"
                >
                  Missing `{blank}` placeholder
                </p>
              </td>
              <td
                class="px-6 py-4 font-semibold text-slate-700 dark:text-slate-200"
              >
                {{ q.correct_answer }}
              </td>
              <td class="px-6 py-4 text-right text-slate-500 dark:text-slate-400">
                {{ q.order_index ?? '—' }}
              </td>
              <td class="px-6 py-4 text-right">
                <button
                  class="text-navy hover:text-navy-light text-xs font-bold"
                  @click="openEdit(q)"
                >
                  Edit
                </button>
              </td>
            </tr>

            <tr v-if="!pending && filtered.length === 0">
              <td
                class="px-6 py-10 text-center text-slate-500 dark:text-slate-400"
                colspan="7"
              >
                No questions found.
              </td>
            </tr>

            <tr v-if="pending">
              <td
                class="px-6 py-10 text-center text-slate-500 dark:text-slate-400"
                colspan="7"
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
        v-if="showEdit"
        class="fixed inset-0 z-[9999] flex items-start justify-center p-4 sm:p-8"
      >
        <div
          class="absolute inset-0 bg-black/50"
          @click="!isUpdating && closeEdit()"
        ></div>

        <div
          class="relative w-[min(800px,calc(100vw-2rem))] max-h-[calc(100dvh-4rem)] overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-2xl"
          @click.stop
        >
          <div
            class="sticky top-0 z-10 p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900"
          >
            <div>
              <h2 class="text-lg font-bold text-navy dark:text-white">
                Edit Question
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Exam: {{ editDraft._examTitle || '-' }} / Section:
                {{ editDraft._sectionTitle || '-' }}
              </p>
            </div>
            <button
              class="p-2 rounded-lg text-slate-400 hover:text-navy hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-white disabled:opacity-50 disabled:pointer-events-none"
              :disabled="isUpdating"
              type="button"
              aria-label="Close modal"
              title="Close"
              @click="closeEdit()"
            >
              <Icon name="heroicons:x-mark" class="w-5 h-5" />
            </button>
          </div>

          <div class="p-5 space-y-6 overflow-y-auto max-h-[calc(100dvh-10rem)]">
            <div
              v-if="editError"
              class="bg-rose-50 border border-rose-200 text-rose-900 rounded-xl p-4 text-sm"
            >
              {{ editError }}
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                  >Type</label
                >
                <select
                  v-model="editDraft.question_type"
                  class="w-full px-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40"
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
                  v-model.number="editDraft.order_index"
                  type="number"
                  min="1"
                  :class="[
                    'w-full px-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40',
                    hasEditFieldError('order_index') &&
                      'border-rose-500 dark:border-rose-500 focus:ring-rose-400',
                  ]"
                />
                <p
                  v-if="editFieldError('order_index')"
                  class="mt-1 text-xs text-rose-600"
                >
                  {{ editFieldError('order_index') }}
                </p>
              </div>
              <div>
                <label
                  class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                  >Correct Answer *</label
                >
                <input
                  v-model="editDraft.correct_answer"
                  type="text"
                  :class="[
                    'w-full px-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40',
                    hasEditFieldError('correct_answer') &&
                      'border-rose-500 dark:border-rose-500 focus:ring-rose-400',
                  ]"
                  placeholder="e.g. library"
                />
                <p
                  v-if="editFieldError('correct_answer')"
                  class="mt-1 text-xs text-rose-600"
                >
                  {{ editFieldError('correct_answer') }}
                </p>
              </div>
              <div class="md:col-span-2">
                <label
                  class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                  >Question Text *</label
                >
                <textarea
                  v-model="editDraft.question_text"
                  rows="3"
                  :class="[
                    'w-full px-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40',
                    hasEditFieldError('question_text') &&
                      'border-rose-500 dark:border-rose-500 focus:ring-rose-400',
                  ]"
                  placeholder="Must include {blank}"
                ></textarea>
                <p
                  v-if="editFieldError('question_text')"
                  class="mt-1 text-xs text-rose-600"
                >
                  {{ editFieldError('question_text') }}
                </p>
              </div>
            </div>

            <div
              v-if="isUpdating"
              class="absolute inset-0 z-20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3"
            >
              <div
                class="w-10 h-10 rounded-full border-4 border-navy/20 border-t-navy dark:border-white/20 dark:border-t-white animate-spin"
              ></div>
              <p class="text-sm font-bold text-navy dark:text-white">
                Updating...
              </p>
            </div>

            <div
              class="sticky bottom-0 z-10 -mx-5 px-5 py-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2"
            >
              <button
                class="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                @click="closeEdit"
                :disabled="isUpdating"
              >
                Cancel
              </button>
              <button
                class="px-4 py-2 text-xs font-bold text-white bg-navy rounded-lg shadow-md shadow-navy/20 hover:bg-navy-light transition disabled:opacity-60"
                @click="updateQuestion"
                :disabled="isUpdating"
              >
                <span class="inline-flex items-center gap-2">
                  <span
                    v-if="isUpdating"
                    class="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin"
                  ></span>
                  {{ isUpdating ? 'Updating...' : 'Update' }}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
