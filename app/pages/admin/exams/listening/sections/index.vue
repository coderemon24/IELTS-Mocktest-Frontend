<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import AdminTinyEditor from '@/components/Admin/TinyEditor.vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

const query = ref('')
const selectedExamId = ref('')
const {
  exams,
  sections,
  pending,
  error,
  refresh,
  endpoint,
  actions,
} = useAdminListeningExams()
const showCreate = ref(false)
const showEdit = ref(false)
const isSaving = ref(false)
const isUpdating = ref(false)
const saveError = ref<string | null>(null)
const editError = ref<string | null>(null)
const deletingId = ref<string | null>(null)
const editingSectionId = ref<string | null>(null)
const fieldErrors = reactive<Record<string, string[]>>({})
const editFieldErrors = reactive<Record<string, string[]>>({})

const clearFieldErrors = () => {
  for (const key of Object.keys(fieldErrors)) delete fieldErrors[key]
}
const clearEditFieldErrors = () => {
  for (const key of Object.keys(editFieldErrors)) delete editFieldErrors[key]
}
const fieldError = (key: string) => fieldErrors[key]?.[0] ?? null
const hasFieldError = (key: string) => !!fieldError(key)
const editFieldError = (key: string) => editFieldErrors[key]?.[0] ?? null
const hasEditFieldError = (key: string) => !!editFieldError(key)

const createDraft = reactive({
  listening_id: '' as string,
  title: '',
  instruction: null as string | null,
  audio: null as string | null,
  order_index: null as number | null,
  status: 'active' as string | null,
  _audioFile: null as File | null,
})

const editDraft = reactive({
  title: '',
  instruction: null as string | null,
  audio: null as string | null,
  order_index: null as number | null,
  status: 'active' as string | null,
  _audioFile: null as File | null,
  _examTitle: null as string | null,
})

const resetCreateDraft = () => {
  createDraft.listening_id = ''
  createDraft.title = ''
  createDraft.instruction = null
  createDraft.audio = null
  createDraft.order_index = null
  createDraft.status = 'active'
  createDraft._audioFile = null
}

const resetEditDraft = () => {
  editDraft.title = ''
  editDraft.instruction = null
  editDraft.audio = null
  editDraft.order_index = null
  editDraft.status = 'active'
  editDraft._audioFile = null
  editDraft._examTitle = null
}

const setCreateAudio = (e: Event) => {
  const input = e.target as HTMLInputElement | null
  const file = input?.files?.[0] ?? null
  createDraft._audioFile = file
  if (file && fieldErrors.audio) delete fieldErrors.audio
}

const setEditAudio = (e: Event) => {
  const input = e.target as HTMLInputElement | null
  const file = input?.files?.[0] ?? null
  editDraft._audioFile = file
  if (file && editFieldErrors.audio) delete editFieldErrors.audio
}

const openCreate = () => {
  resetCreateDraft()
  saveError.value = null
  clearFieldErrors()
  showCreate.value = true
}

const openEdit = (section: any) => {
  const sectionId = section.unique_id
  if (!sectionId) {
    alert('Missing unique_id for this section.')
    return
  }
  resetEditDraft()
  editDraft.title = section.title ?? ''
  editDraft.instruction = section.instruction ?? null
  editDraft.audio = section.audio ?? null
  editDraft.order_index = section.order_index ?? null
  editDraft.status = section.status ?? 'active'
  editDraft._examTitle = section.exam?.title ?? null
  editingSectionId.value = sectionId
  editError.value = null
  clearEditFieldErrors()
  showEdit.value = true
}

const closeEdit = () => {
  showEdit.value = false
}

const closeCreate = () => {
  showCreate.value = false
}

const validateCreateDraft = () => {
  clearFieldErrors()
  if (!createDraft.listening_id) {
    fieldErrors.listening_id = ['Exam is required.']
  }
  if (!createDraft.title?.trim()) fieldErrors.title = ['Title is required.']
  if (createDraft.order_index != null && Number(createDraft.order_index) < 1) {
    fieldErrors.order_index = ['Order must be at least 1.']
  }
  if (!createDraft._audioFile) fieldErrors.audio = ['Audio is required.']
  return Object.keys(fieldErrors).length === 0
}

const validateEditDraft = () => {
  clearEditFieldErrors()
  if (!editDraft.title?.trim()) editFieldErrors.title = ['Title is required.']
  if (editDraft.order_index != null && Number(editDraft.order_index) < 1) {
    editFieldErrors.order_index = ['Order must be at least 1.']
  }
  return Object.keys(editFieldErrors).length === 0
}

const createSection = async () => {
  saveError.value = null
  clearFieldErrors()
  if (!validateCreateDraft()) return

  isSaving.value = true
  try {
    const form = new FormData()
    form.append('listening_id', createDraft.listening_id)
    form.append('title', createDraft.title)
    if (createDraft.instruction) form.append('instruction', createDraft.instruction)
    if (createDraft.order_index != null)
      form.append('order_index', String(createDraft.order_index))
    if (createDraft.status) form.append('status', String(createDraft.status))
    if (createDraft._audioFile) form.append('audio', createDraft._audioFile)

    await actions.createSection(form)
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
        e?.response?.data?.message || e?.message || 'Failed to create section.'
    }
  } finally {
    isSaving.value = false
  }
}

const updateSection = async () => {
  editError.value = null
  clearEditFieldErrors()
  if (!validateEditDraft()) return
  if (!editingSectionId.value) {
    editError.value = 'Missing section identifier.'
    return
  }

  isUpdating.value = true
  try {
    let payload: any = {
      title: editDraft.title,
      instruction: editDraft.instruction,
      order_index: editDraft.order_index,
      status: editDraft.status,
    }

    if (editDraft._audioFile) {
      const form = new FormData()
      form.append('title', editDraft.title)
      if (editDraft.instruction) form.append('instruction', editDraft.instruction)
      if (editDraft.order_index != null)
        form.append('order_index', String(editDraft.order_index))
      if (editDraft.status) form.append('status', String(editDraft.status))
      form.append('audio', editDraft._audioFile)
      payload = form
    }

    await actions.updateSection(editingSectionId.value, payload)
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
        e?.response?.data?.message || e?.message || 'Failed to update section.'
    }
  } finally {
    isUpdating.value = false
  }
}

const deleteSection = async (section: any) => {
  const sectionId = section.unique_id
  if (!sectionId) {
    alert('Missing unique_id for this section.')
    return
  }
  const ok = confirm(`Delete "${section.title}"?`)
  if (!ok) return

  deletingId.value = sectionId
  try {
    await actions.deleteSection(sectionId)
    await refresh()
  } catch (e: any) {
    alert(e?.response?.data?.message || e?.message || 'Failed to delete section.')
  } finally {
    deletingId.value = null
  }
}

const setBodyScrollLocked = (locked: boolean) => {
  document.body.style.overflow = locked ? 'hidden' : ''
}

watch([showCreate, showEdit], ([createOpen, editOpen]) =>
  setBodyScrollLocked(createOpen || editOpen),
)

const onKeyDown = (e: KeyboardEvent) => {
  if (!showCreate.value && !showEdit.value) return
  if (e.key !== 'Escape') return
  if (showEdit.value && !isUpdating.value) {
    closeEdit()
    return
  }
  if (showCreate.value && !isSaving.value) closeCreate()
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
  setBodyScrollLocked(false)
})

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  const examId = selectedExamId.value
  let list = sections.value
  if (examId) list = list.filter((s) => String(s.exam?.unique_id ?? '') === examId)
  if (!q) return list
  return list.filter((s) => {
    const hay = [
      s.exam?.title,
      s.title,
      s.instruction,
      s.audio,
      String(s.order_index ?? ''),
      String(s.status ?? ''),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return hay.includes(q)
  })
})

const examOptions = computed(() =>
  [...exams.value].filter((e) => e.unique_id).sort((a, b) => {
    const aTitle = a.title?.toLowerCase() ?? ''
    const bTitle = b.title?.toLowerCase() ?? ''
    return aTitle.localeCompare(bTitle)
  }),
)
</script>

<template>
  <div class="space-y-6">
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800"
    >
      <div>
        <h1 class="text-xl font-bold text-navy dark:text-white">
          Listening Exam Sections
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
          All sections across listening exams.
        </p>
      </div>
      <div class="flex gap-2">
        <button
          class="px-4 py-2 text-xs font-bold text-white bg-navy rounded-lg shadow-md shadow-navy/20 hover:bg-navy-light transition"
          @click="openCreate"
        >
          + New Section
        </button>
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
          <p class="text-sm font-bold text-navy dark:text-white">Sections</p>
          <span
            class="text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500"
          >
            {{ filtered.length }}
          </span>
        </div>
        <div class="flex gap-2 w-full sm:w-auto">
          <select
            v-model="selectedExamId"
            class="w-full sm:w-56 px-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40"
          >
            <option value="">All exams</option>
            <option
              v-for="exam in examOptions"
              :key="String(exam.unique_id)"
              :value="String(exam.unique_id)"
            >
              {{ exam.title }}
            </option>
          </select>
          <input
            v-model="query"
            type="text"
            placeholder="Search sections..."
            class="w-full sm:w-80 px-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40"
          />
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr
              class="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 font-bold uppercase tracking-wider"
            >
              <th class="px-6 py-3">Exam</th>
              <th class="px-6 py-3">Section</th>
              <th class="px-6 py-3">Audio</th>
              <th class="px-6 py-3">Order</th>
              <th class="px-6 py-3">Status</th>
              <th class="px-6 py-3 text-right">Questions</th>
              <th class="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr
              v-for="(s, idx) in filtered"
              :key="String(s.id ?? idx)"
              class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
            >
              <td class="px-6 py-4 font-bold text-navy dark:text-white">
                {{ s.exam?.title || '—' }}
              </td>
              <td class="px-6 py-4">
                <p class="font-semibold text-slate-700 dark:text-slate-200">
                  {{ s.title }}
                </p>
                <p
                  v-if="s.instruction"
                  class="text-[11px] text-slate-400 line-clamp-2"
                >
                  {{ s.instruction }}
                </p>
              </td>
              <td class="px-6 py-4 text-slate-500 dark:text-slate-400">
                <div v-if="s.audio" class="flex flex-col gap-2">
                  <audio controls class="w-56">
                    <source :src="s.audio" />
                  </audio>
                  <!-- <a
                    :href="s.audio"
                    target="_blank"
                    rel="noopener"
                    class="text-[11px] text-slate-500 hover:text-navy dark:text-slate-400 dark:hover:text-white break-all"
                  >
                    {{ s.audio }}
                  </a> -->
                </div>
                <span v-else>—</span>
              </td>
              <td class="px-6 py-4 text-slate-500 dark:text-slate-400">
                {{ s.order_index ?? '—' }}
              </td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    'text-[10px] font-bold px-2 py-1 rounded-full',
                    (s.status ?? 'active') === 'active'
                      ? 'bg-mint/15 text-mint'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500',
                  ]"
                >
                  {{ s.status ?? 'active' }}
                </span>
              </td>
              <td
                class="px-6 py-4 text-right font-bold text-slate-600 dark:text-slate-300"
              >
                {{ s.questions?.length ?? 0 }}
              </td>
              <td class="px-6 py-4 text-right">
                <button
                  class="text-navy hover:text-navy-light text-xs font-bold"
                  @click="openEdit(s)"
                >
                  Edit
                </button>
                <button
                  class="ml-3 text-rose-600 hover:text-rose-700 text-xs font-bold disabled:opacity-60"
                  :disabled="deletingId === s.unique_id"
                  @click="deleteSection(s)"
                >
                  {{ deletingId === s.unique_id ? 'Deleting...' : 'Delete' }}
                </button>
              </td>
            </tr>

            <tr v-if="!pending && filtered.length === 0">
              <td
                class="px-6 py-10 text-center text-slate-500 dark:text-slate-400"
                colspan="7"
              >
                No sections found.
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
        v-if="showCreate"
        class="fixed inset-0 z-[9999] flex items-start justify-center p-4 sm:p-8"
      >
        <div
          class="absolute inset-0 bg-black/50"
          @click="!isSaving && closeCreate()"
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
                New Section
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Choose the listening exam and add section details.
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
              <div class="md:col-span-2">
                <label
                  class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                  >Exam *</label
                >
                <select
                  v-model="createDraft.listening_id"
                  :class="[
                    'w-full px-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40',
                    hasFieldError('listening_id') &&
                      'border-rose-500 dark:border-rose-500 focus:ring-rose-400',
                  ]"
                >
                  <option value="">Select exam</option>
                  <option
                    v-for="exam in examOptions"
                    :key="String(exam.unique_id)"
                    :value="String(exam.unique_id)"
                  >
                    {{ exam.title }}
                  </option>
                </select>
                <p
                  v-if="fieldError('listening_id')"
                  class="mt-1 text-xs text-rose-600"
                >
                  {{ fieldError('listening_id') }}
                </p>
              </div>
              <div>
                <label
                  class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                  >Title *</label
                >
                <input
                  v-model="createDraft.title"
                  type="text"
                  :class="[
                    'w-full px-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40',
                    hasFieldError('title') &&
                      'border-rose-500 dark:border-rose-500 focus:ring-rose-400',
                  ]"
                  placeholder="e.g. Section 1"
                />
                <p
                  v-if="fieldError('title')"
                  class="mt-1 text-xs text-rose-600"
                >
                  {{ fieldError('title') }}
                </p>
              </div>
              <div>
                <label
                  class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                  >Order</label
                >
                <input
                  v-model.number="createDraft.order_index"
                  type="number"
                  min="1"
                  :class="[
                    'w-full px-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40',
                    hasFieldError('order_index') &&
                      'border-rose-500 dark:border-rose-500 focus:ring-rose-400',
                  ]"
                />
                <p
                  v-if="fieldError('order_index')"
                  class="mt-1 text-xs text-rose-600"
                >
                  {{ fieldError('order_index') }}
                </p>
              </div>
              <div class="md:col-span-2">
                <label
                  class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                  >Instruction</label
                >
                <div class="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
                  <AdminTinyEditor
                    v-model="createDraft.instruction"
                    placeholder="Optional section instruction..."
                    :height="140"
                  />
                </div>
              </div>
              <div>
                <label
                  class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                  >Audio (upload) *</label
                >
                <input
                  type="file"
                  accept="audio/*"
                  :class="[
                    'block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 dark:file:bg-slate-800 dark:file:text-slate-200 dark:hover:file:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-mint/40',
                    hasFieldError('audio') &&
                      'border-rose-500 dark:border-rose-500 focus:ring-rose-400',
                  ]"
                  @change="setCreateAudio($event)"
                />
                <p class="mt-1 text-[11px] text-slate-400">
                  Selected:
                  <span class="font-medium">{{
                    createDraft._audioFile?.name || 'No file selected'
                  }}</span>
                </p>
                <p
                  v-if="fieldError('audio')"
                  class="mt-1 text-xs text-rose-600"
                >
                  {{ fieldError('audio') }}
                </p>
              </div>
              <div>
                <label
                  class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                  >Status</label
                >
                <select
                  v-model="createDraft.status"
                  class="w-full px-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40"
                >
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>
              </div>
            </div>

            <div
              v-if="isSaving"
              class="absolute inset-0 z-20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm flex flex-col items-center justify-center gap-3"
            >
              <div
                class="w-10 h-10 rounded-full border-4 border-navy/20 border-t-navy dark:border-white/20 dark:border-t-white animate-spin"
              ></div>
              <p class="text-sm font-bold text-navy dark:text-white">
                Saving...
              </p>
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
                @click="createSection"
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
          </div>
        </div>
      </div>
    </Teleport>

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
                Edit Section
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Exam: {{ editDraft._examTitle || 'â€”' }}
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
                  >Title *</label
                >
                <input
                  v-model="editDraft.title"
                  type="text"
                  :class="[
                    'w-full px-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40',
                    hasEditFieldError('title') &&
                      'border-rose-500 dark:border-rose-500 focus:ring-rose-400',
                  ]"
                  placeholder="e.g. Section 1"
                />
                <p
                  v-if="editFieldError('title')"
                  class="mt-1 text-xs text-rose-600"
                >
                  {{ editFieldError('title') }}
                </p>
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
              <div class="md:col-span-2">
                <label
                  class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                  >Instruction</label
                >
                <div class="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
                  <AdminTinyEditor
                    v-model="editDraft.instruction"
                    placeholder="Optional section instruction..."
                    :height="140"
                  />
                </div>
              </div>
              <div>
                <label
                  class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                  >Audio (upload)</label
                >
                <input
                  type="file"
                  accept="audio/*"
                  :class="[
                    'block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-bold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200 dark:file:bg-slate-800 dark:file:text-slate-200 dark:hover:file:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-mint/40',
                    hasEditFieldError('audio') &&
                      'border-rose-500 dark:border-rose-500 focus:ring-rose-400',
                  ]"
                  @change="setEditAudio($event)"
                />
                <p class="mt-1 text-[11px] text-slate-400">
                  Current: <span class="font-medium">{{ editDraft.audio || 'â€”' }}</span>
                </p>
                <p class="mt-1 text-[11px] text-slate-400">
                  Selected:
                  <span class="font-medium">{{
                    editDraft._audioFile?.name || 'No file selected'
                  }}</span>
                </p>
                <p
                  v-if="editFieldError('audio')"
                  class="mt-1 text-xs text-rose-600"
                >
                  {{ editFieldError('audio') }}
                </p>
              </div>
              <div>
                <label
                  class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                  >Status</label
                >
                <select
                  v-model="editDraft.status"
                  class="w-full px-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40"
                >
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                </select>
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
                @click="updateSection"
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
