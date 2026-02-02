<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch,
} from 'vue'

import type { Plan } from '@/composables/useAdminPlans'
import {
  adminPlansEndpoint,
  useAdminPlans,
} from '@/composables/useAdminPlans'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

const query = ref('')
const showCreate = ref(false)
const showEdit = ref(false)
const isSaving = ref(false)
const isUpdating = ref(false)
const saveError = ref<string | null>(null)
const editError = ref<string | null>(null)
const deletingId = ref<string | null>(null)
const editingPlanId = ref<string | null>(null)

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

const emptyPlan = (): Plan => ({
  name: '',
  price: 0,
  duration_days: null,
  is_active: true,
})

const draft = reactive<Plan>(emptyPlan())
const editDraft = reactive<Plan>(emptyPlan())

const resetDraft = () => {
  Object.assign(draft, emptyPlan())
}
const resetEditDraft = () => {
  Object.assign(editDraft, emptyPlan())
}

const { plans, pending, error, refresh, endpoint, actions } = useAdminPlans()

const planId = (plan: Plan) =>
  String(plan.id ?? plan.unique_id ?? '')

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return plans.value
  return plans.value.filter((p) => {
    const hay = [
      p.name,
      String(p.price ?? ''),
      String(p.duration_days ?? ''),
      String(p.is_active ?? ''),
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

const openEdit = (plan: Plan) => {
  const id = planId(plan)
  if (!id) {
    alert('Missing id for this plan.')
    return
  }
  resetEditDraft()
  editDraft.name = plan.name ?? ''
  editDraft.price = plan.price ?? 0
  editDraft.duration_days = plan.duration_days ?? null
  editDraft.is_active = Boolean(plan.is_active)
  editingPlanId.value = id
  editError.value = null
  clearEditFieldErrors()
  showEdit.value = true
}

const closeEdit = () => {
  showEdit.value = false
}

const validateDraft = () => {
  clearFieldErrors()
  if (!draft.name?.trim()) fieldErrors.name = ['Name is required.']
  if (draft.price != null && Number(draft.price) < 0) {
    fieldErrors.price = ['Price must be 0 or greater.']
  }
  if (draft.duration_days != null && Number(draft.duration_days) < 1) {
    fieldErrors.duration_days = ['Duration must be at least 1.']
  }
  return Object.keys(fieldErrors).length === 0
}

const validateEditDraft = () => {
  clearEditFieldErrors()
  if (!editDraft.name?.trim()) editFieldErrors.name = ['Name is required.']
  if (editDraft.price != null && Number(editDraft.price) < 0) {
    editFieldErrors.price = ['Price must be 0 or greater.']
  }
  if (editDraft.duration_days != null && Number(editDraft.duration_days) < 1) {
    editFieldErrors.duration_days = ['Duration must be at least 1.']
  }
  return Object.keys(editFieldErrors).length === 0
}

const save = async () => {
  saveError.value = null
  clearFieldErrors()
  if (!validateDraft()) return

  isSaving.value = true
  try {
    const payload = {
      name: draft.name,
      price: draft.price,
      duration_days: draft.duration_days,
      is_active: draft.is_active,
    }
    await actions.createPlan(payload)
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
        e?.response?.data?.message || e?.message || 'Failed to create plan.'
    }
  } finally {
    isSaving.value = false
  }
}

const updatePlan = async () => {
  editError.value = null
  clearEditFieldErrors()
  if (!validateEditDraft()) return
  if (!editingPlanId.value) {
    editError.value = 'Missing plan identifier.'
    return
  }

  isUpdating.value = true
  try {
    const payload = {
      name: editDraft.name,
      price: editDraft.price,
      duration_days: editDraft.duration_days,
      is_active: editDraft.is_active,
    }
    await actions.updatePlan(editingPlanId.value, payload)
    closeEdit()
    await refresh()
  } catch (e: any) {
    const serverErrors = e?.response?.data?.errors
    if (serverErrors && typeof serverErrors === 'object') {
      for (const [key, value] of Object.entries(serverErrors)) {
        if (Array.isArray(value))
          editFieldErrors[String(key)] = value as string[]
      }
    }
    if (Object.keys(editFieldErrors).length === 0) {
      editError.value =
        e?.response?.data?.message || e?.message || 'Failed to update plan.'
    }
  } finally {
    isUpdating.value = false
  }
}

const deletePlan = async (plan: Plan) => {
  const id = planId(plan)
  if (!id) {
    alert('Missing id for this plan.')
    return
  }
  const ok = confirm(`Delete "${plan.name}"?`)
  if (!ok) return

  deletingId.value = id
  try {
    await actions.deletePlan(id)
    await refresh()
  } catch (e: any) {
    alert(e?.response?.data?.message || e?.message || 'Failed to delete plan.')
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
</script>

<template>
  <div class="space-y-6">
    <div
      class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800"
    >
      <div>
        <h1 class="text-xl font-bold text-navy dark:text-white">Plans</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Manage subscription plans.
        </p>
      </div>
      <div class="flex gap-2">
        <button
          class="px-4 py-2 text-xs font-bold text-white bg-navy rounded-lg shadow-md shadow-navy/20 hover:bg-navy-light transition"
          @click="openCreate"
        >
          + New Plan
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
          <p class="text-sm font-bold text-navy dark:text-white">Plans</p>
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
            placeholder="Search plans..."
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
              <th class="px-6 py-3">Name</th>
              <th class="px-6 py-3">Price</th>
              <th class="px-6 py-3">Duration (days)</th>
              <th class="px-6 py-3">Status</th>
              <th class="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr
              v-for="(p, idx) in filtered"
              :key="String(p.id ?? p.unique_id ?? idx)"
              class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
            >
              <td class="px-6 py-4">
                <p class="font-bold text-navy dark:text-white">{{ p.name }}</p>
              </td>
              <td class="px-6 py-4 text-slate-600 dark:text-slate-300">
                {{ p.price ?? 0 }}
              </td>
              <td class="px-6 py-4 text-slate-600 dark:text-slate-300">
                {{ p.duration_days ?? '—' }}
              </td>
              <td class="px-6 py-4">
                <span
                  :class="[
                    'text-[10px] font-bold px-2 py-1 rounded-full',
                    p.is_active
                      ? 'bg-mint/15 text-mint'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500',
                  ]"
                >
                  {{ p.is_active ? 'active' : 'inactive' }}
                </span>
              </td>
              <td class="px-6 py-4 text-right">
                <div class="inline-flex items-center gap-3">
                  <button
                    class="text-navy hover:text-navy-light text-xs font-bold"
                    @click="openEdit(p)"
                  >
                    Edit
                  </button>
                  <button
                    class="text-rose-600 hover:text-rose-700 text-xs font-bold disabled:opacity-60"
                    :disabled="deletingId === planId(p)"
                    @click="deletePlan(p)"
                  >
                    {{ deletingId === planId(p) ? 'Deleting...' : 'Delete' }}
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!pending && filtered.length === 0">
              <td
                class="px-6 py-10 text-center text-slate-500 dark:text-slate-400"
                colspan="5"
              >
                No plans found.
              </td>
            </tr>

            <tr v-if="pending">
              <td
                class="px-6 py-10 text-center text-slate-500 dark:text-slate-400"
                colspan="5"
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
          class="relative w-[min(700px,calc(100vw-2rem))] max-h-[calc(100dvh-4rem)] overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-2xl"
          @click.stop
        >
          <div
            class="sticky top-0 z-10 p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900"
          >
            <div>
              <h2 class="text-lg font-bold text-navy dark:text-white">
                New Plan
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Create a subscription plan.
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
                  >Name *</label
                >
                <input
                  v-model="draft.name"
                  type="text"
                  :class="[
                    'w-full px-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40',
                    hasFieldError('name') &&
                      'border-rose-500 dark:border-rose-500 focus:ring-rose-400',
                  ]"
                  placeholder="e.g. Starter"
                />
                <p v-if="fieldError('name')" class="mt-1 text-xs text-rose-600">
                  {{ fieldError('name') }}
                </p>
              </div>
              <div>
                <label
                  class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                  >Price</label
                >
                <input
                  v-model.number="draft.price"
                  type="number"
                  min="0"
                  :class="[
                    'w-full px-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40',
                    hasFieldError('price') &&
                      'border-rose-500 dark:border-rose-500 focus:ring-rose-400',
                  ]"
                  placeholder="e.g. 499"
                />
                <p
                  v-if="fieldError('price')"
                  class="mt-1 text-xs text-rose-600"
                >
                  {{ fieldError('price') }}
                </p>
              </div>
              <div>
                <label
                  class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                  >Duration (days)</label
                >
                <input
                  v-model.number="draft.duration_days"
                  type="number"
                  min="1"
                  :class="[
                    'w-full px-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40',
                    hasFieldError('duration_days') &&
                      'border-rose-500 dark:border-rose-500 focus:ring-rose-400',
                  ]"
                  placeholder="e.g. 30"
                />
                <p
                  v-if="fieldError('duration_days')"
                  class="mt-1 text-xs text-rose-600"
                >
                  {{ fieldError('duration_days') }}
                </p>
              </div>
              <div>
                <label
                  class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                  >Status</label
                >
                <select
                  v-model="draft.is_active"
                  class="w-full px-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40"
                >
                  <option :value="true">active</option>
                  <option :value="false">inactive</option>
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
              <span class="font-mono">{{ adminPlansEndpoint }}</span>
            </p>
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
          class="relative w-[min(700px,calc(100vw-2rem))] max-h-[calc(100dvh-4rem)] overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-2xl"
          @click.stop
        >
          <div
            class="sticky top-0 z-10 p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900"
          >
            <div>
              <h2 class="text-lg font-bold text-navy dark:text-white">
                Edit Plan
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Update plan details.
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
                  >Name *</label
                >
                <input
                  v-model="editDraft.name"
                  type="text"
                  :class="[
                    'w-full px-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40',
                    hasEditFieldError('name') &&
                      'border-rose-500 dark:border-rose-500 focus:ring-rose-400',
                  ]"
                  placeholder="e.g. Pro"
                />
                <p
                  v-if="editFieldError('name')"
                  class="mt-1 text-xs text-rose-600"
                >
                  {{ editFieldError('name') }}
                </p>
              </div>
              <div>
                <label
                  class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                  >Price</label
                >
                <input
                  v-model.number="editDraft.price"
                  type="number"
                  min="0"
                  :class="[
                    'w-full px-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40',
                    hasEditFieldError('price') &&
                      'border-rose-500 dark:border-rose-500 focus:ring-rose-400',
                  ]"
                  placeholder="e.g. 999"
                />
                <p
                  v-if="editFieldError('price')"
                  class="mt-1 text-xs text-rose-600"
                >
                  {{ editFieldError('price') }}
                </p>
              </div>
              <div>
                <label
                  class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                  >Duration (days)</label
                >
                <input
                  v-model.number="editDraft.duration_days"
                  type="number"
                  min="1"
                  :class="[
                    'w-full px-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40',
                    hasEditFieldError('duration_days') &&
                      'border-rose-500 dark:border-rose-500 focus:ring-rose-400',
                  ]"
                  placeholder="e.g. 30"
                />
                <p
                  v-if="editFieldError('duration_days')"
                  class="mt-1 text-xs text-rose-600"
                >
                  {{ editFieldError('duration_days') }}
                </p>
              </div>
              <div>
                <label
                  class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                  >Status</label
                >
                <select
                  v-model="editDraft.is_active"
                  class="w-full px-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40"
                >
                  <option :value="true">active</option>
                  <option :value="false">inactive</option>
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
                @click="updatePlan"
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
