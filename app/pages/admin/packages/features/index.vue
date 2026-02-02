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
import { adminPlanFeaturesEndpoint, useAdminPlans } from '@/composables/useAdminPlans'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

type FeatureDraft = {
  feature_key: string
  valueType: 'boolean' | 'number' | 'unlimited' | 'text'
  feature_value: boolean | number | string
}

const query = ref('')
const selectedPlanId = ref<string | null>(null)
const showCreate = ref(false)
const showEdit = ref(false)
const isSaving = ref(false)
const isUpdating = ref(false)
const saveError = ref<string | null>(null)
const editError = ref<string | null>(null)
const deletingId = ref<string | null>(null)
const editingFeatureId = ref<string | null>(null)

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

const emptyFeature = (): FeatureDraft => ({
  feature_key: '',
  valueType: 'boolean',
  feature_value: true,
})

const draft = reactive<FeatureDraft>(emptyFeature())
const editDraft = reactive<FeatureDraft>(emptyFeature())

const resetDraft = () => {
  Object.assign(draft, emptyFeature())
}
const resetEditDraft = () => {
  Object.assign(editDraft, emptyFeature())
}

const {
  plans,
  pending: plansPending,
  error: plansError,
  refresh: refreshPlans,
  actions,
  normalizeFeatures,
} = useAdminPlans()

const currentPlan = computed<Plan | null>(() => {
  if (!selectedPlanId.value) return null
  return plans.value.find(
    (p) => String(p.id ?? p.unique_id ?? '') === selectedPlanId.value,
  ) as Plan | null
})

watch(
  plans,
  (list) => {
    if (!selectedPlanId.value && list.length > 0) {
      selectedPlanId.value = String(list[0].id ?? list[0].unique_id ?? '')
    }
  },
  { immediate: true },
)

const {
  data: featuresData,
  pending: featuresPending,
  error: featuresError,
  refresh: refreshFeatures,
} = useAsyncData(
  'admin:plan-features',
  async () => {
    if (!selectedPlanId.value) return []
    const response = await actions.listFeatures(selectedPlanId.value)
    return normalizeFeatures(response.data)
  },
  { watch: [selectedPlanId] },
)

const features = computed(() => featuresData.value ?? [])

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return features.value
  return features.value.filter((f: any) => {
    const hay = [
      f.feature_key,
      String(f.feature_value ?? ''),
      currentPlan.value?.name,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    return hay.includes(q)
  })
})

const openCreate = () => {
  if (!selectedPlanId.value) {
    alert('Select a plan first.')
    return
  }
  resetDraft()
  saveError.value = null
  clearFieldErrors()
  showCreate.value = true
}

const closeCreate = () => {
  showCreate.value = false
}

const inferValueType = (value: any): FeatureDraft['valueType'] => {
  if (value == 'unlimited') return 'unlimited'
  if (typeof value === 'boolean') return 'boolean'
  if (typeof value === 'number') return 'number'
  return 'text'
}

const openEdit = (feature: any) => {
  const id = String(feature.id ?? feature.unique_id ?? '')
  if (!id) {
    alert('Missing id for this feature.')
    return
  }
  resetEditDraft()
  editDraft.feature_key = feature.feature_key ?? ''
  editDraft.valueType = inferValueType(feature.feature_value)
  editDraft.feature_value =
    editDraft.valueType === 'unlimited' ? 'unlimited' : feature.feature_value
  editingFeatureId.value = id
  editError.value = null
  clearEditFieldErrors()
  showEdit.value = true
}

const closeEdit = () => {
  showEdit.value = false
}

const buildPayload = (source: FeatureDraft) => {
  let value: any = source.feature_value
  if (source.valueType === 'boolean') value = Boolean(source.feature_value)
  if (source.valueType === 'number') value = Number(source.feature_value)
  if (source.valueType === 'unlimited') value = 'unlimited'
  if (source.valueType === 'text') value = String(source.feature_value ?? '')
  return {
    feature_key: source.feature_key,
    feature_value: value,
  }
}

const validateDraft = (source: FeatureDraft, errors: Record<string, string[]>) => {
  if (!source.feature_key?.trim()) errors.feature_key = ['Feature key is required.']
  if (source.valueType === 'number' && Number.isNaN(Number(source.feature_value))) {
    errors.feature_value = ['Enter a valid number.']
  }
  if (source.valueType === 'text' && !String(source.feature_value ?? '').trim()) {
    errors.feature_value = ['Feature value is required.']
  }
  return Object.keys(errors).length === 0
}

const save = async () => {
  if (!selectedPlanId.value) {
    saveError.value = 'Select a plan first.'
    return
  }
  saveError.value = null
  clearFieldErrors()
  if (!validateDraft(draft, fieldErrors)) return

  isSaving.value = true
  try {
    await actions.createFeature(selectedPlanId.value, buildPayload(draft))
    closeCreate()
    await refreshFeatures()
  } catch (e: any) {
    const serverErrors = e?.response?.data?.errors
    if (serverErrors && typeof serverErrors === 'object') {
      for (const [key, value] of Object.entries(serverErrors)) {
        if (Array.isArray(value)) fieldErrors[String(key)] = value as string[]
      }
    }
    if (Object.keys(fieldErrors).length === 0) {
      saveError.value =
        e?.response?.data?.message || e?.message || 'Failed to create feature.'
    }
  } finally {
    isSaving.value = false
  }
}

const updateFeature = async () => {
  if (!selectedPlanId.value) {
    editError.value = 'Select a plan first.'
    return
  }
  editError.value = null
  clearEditFieldErrors()
  if (!validateDraft(editDraft, editFieldErrors)) return
  if (!editingFeatureId.value) {
    editError.value = 'Missing feature identifier.'
    return
  }

  isUpdating.value = true
  try {
    await actions.updateFeature(
      selectedPlanId.value,
      editingFeatureId.value,
      buildPayload(editDraft),
    )
    closeEdit()
    await refreshFeatures()
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
        e?.response?.data?.message || e?.message || 'Failed to update feature.'
    }
  } finally {
    isUpdating.value = false
  }
}

const deleteFeature = async (feature: any) => {
  if (!selectedPlanId.value) {
    alert('Select a plan first.')
    return
  }
  const id = String(feature.id ?? feature.unique_id ?? '')
  if (!id) {
    alert('Missing id for this feature.')
    return
  }
  const ok = confirm(`Delete "${feature.feature_key}"?`)
  if (!ok) return

  deletingId.value = id
  try {
    await actions.deleteFeature(selectedPlanId.value, id)
    await refreshFeatures()
  } catch (e: any) {
    alert(e?.response?.data?.message || e?.message || 'Failed to delete feature.')
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
        <h1 class="text-xl font-bold text-navy dark:text-white">Features</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
          Manage plan features by plan.
        </p>
      </div>
      <div class="flex gap-2">
        <button
          class="px-4 py-2 text-xs font-bold text-white bg-navy rounded-lg shadow-md shadow-navy/20 hover:bg-navy-light transition"
          @click="openCreate"
        >
          + New Feature
        </button>
      </div>
    </div>

    <div
      v-if="plansError"
      class="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 text-sm"
    >
      Failed to load plans. Check backend route `GET /plans`.
    </div>

    <div
      class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden"
    >
      <div
        class="p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
      >
        <div class="flex items-center gap-2">
          <p class="text-sm font-bold text-navy dark:text-white">Features</p>
          <span
            class="text-[10px] font-bold px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500"
          >
            {{ filtered.length }}
          </span>
        </div>
        <div class="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <select
            v-model="selectedPlanId"
            class="w-full sm:w-64 px-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40"
          >
            <option v-if="plansPending" disabled value="">
              Loading plans...
            </option>
            <option v-if="!plansPending && plans.length === 0" disabled value="">
              No plans available
            </option>
            <option
              v-for="plan in plans"
              :key="String(plan.id ?? plan.unique_id)"
              :value="String(plan.id ?? plan.unique_id)"
            >
              {{ plan.name }}
            </option>
          </select>
          <input
            v-model="query"
            type="text"
            placeholder="Search features..."
            class="w-full sm:w-80 px-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40"
          />
          <button
            class="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition shrink-0"
            @click="() => { refreshPlans(); refreshFeatures(); }"
          >
            Refresh
          </button>
        </div>
      </div>

      <div
        v-if="featuresError"
        class="px-5 pt-4 text-sm text-amber-700"
      >
        Failed to load features for this plan.
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr
              class="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 font-bold uppercase tracking-wider"
            >
              <th class="px-6 py-3">Key</th>
              <th class="px-6 py-3">Value</th>
              <th class="px-6 py-3">Plan</th>
              <th class="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr
              v-for="(f, idx) in filtered"
              :key="String(f.id ?? f.unique_id ?? idx)"
              class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
            >
              <td class="px-6 py-4">
                <p class="font-bold text-navy dark:text-white">
                  {{ f.feature_key }}
                </p>
              </td>
              <td class="px-6 py-4 text-slate-600 dark:text-slate-300">
                {{ f.feature_value }}
              </td>
              <td class="px-6 py-4 text-slate-600 dark:text-slate-300">
                {{ currentPlan?.name || '?' }}
              </td>
              <td class="px-6 py-4 text-right">
                <div class="inline-flex items-center gap-3">
                  <button
                    class="text-navy hover:text-navy-light text-xs font-bold"
                    @click="openEdit(f)"
                  >
                    Edit
                  </button>
                  <button
                    class="text-rose-600 hover:text-rose-700 text-xs font-bold disabled:opacity-60"
                    :disabled="deletingId === String(f.id ?? f.unique_id ?? '')"
                    @click="deleteFeature(f)"
                  >
                    {{
                      deletingId === String(f.id ?? f.unique_id ?? '')
                        ? 'Deleting...'
                        : 'Delete'
                    }}
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="!featuresPending && filtered.length === 0">
              <td
                class="px-6 py-10 text-center text-slate-500 dark:text-slate-400"
                colspan="4"
              >
                No features found.
              </td>
            </tr>

            <tr v-if="featuresPending">
              <td
                class="px-6 py-10 text-center text-slate-500 dark:text-slate-400"
                colspan="4"
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
                New Feature
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Plan: {{ currentPlan?.name || '?' }}
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
                  >Feature Key *</label
                >
                <input
                  v-model="draft.feature_key"
                  type="text"
                  :class="[
                    'w-full px-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40',
                    hasFieldError('feature_key') &&
                      'border-rose-500 dark:border-rose-500 focus:ring-rose-400',
                  ]"
                  placeholder="e.g. mock_test_limit"
                />
                <p
                  v-if="fieldError('feature_key')"
                  class="mt-1 text-xs text-rose-600"
                >
                  {{ fieldError('feature_key') }}
                </p>
              </div>
              <div>
                <label
                  class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                  >Value Type</label
                >
                <select
                  v-model="draft.valueType"
                  class="w-full px-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40"
                >
                  <option value="boolean">boolean</option>
                  <option value="number">number</option>
                  <option value="unlimited">unlimited</option>
                  <option value="text">text</option>
                </select>
              </div>
              <div v-if="draft.valueType === 'boolean'">
                <label
                  class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                  >Value</label
                >
                <select
                  v-model="draft.feature_value"
                  class="w-full px-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40"
                >
                  <option :value="true">true</option>
                  <option :value="false">false</option>
                </select>
              </div>
              <div v-else-if="draft.valueType === 'number'">
                <label
                  class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                  >Value</label
                >
                <input
                  v-model.number="draft.feature_value"
                  type="number"
                  :class="[
                    'w-full px-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40',
                    hasFieldError('feature_value') &&
                      'border-rose-500 dark:border-rose-500 focus:ring-rose-400',
                  ]"
                  placeholder="e.g. 10"
                />
                <p
                  v-if="fieldError('feature_value')"
                  class="mt-1 text-xs text-rose-600"
                >
                  {{ fieldError('feature_value') }}
                </p>
              </div>
              <div v-else-if="draft.valueType === 'unlimited'">
                <label
                  class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                  >Value</label
                >
                <input
                  value="unlimited"
                  disabled
                  class="w-full px-4 py-2 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500"
                />
              </div>
              <div v-else>
                <label
                  class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                  >Value</label
                >
                <input
                  v-model="draft.feature_value"
                  type="text"
                  :class="[
                    'w-full px-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40',
                    hasFieldError('feature_value') &&
                      'border-rose-500 dark:border-rose-500 focus:ring-rose-400',
                  ]"
                  placeholder="e.g. true"
                />
                <p
                  v-if="fieldError('feature_value')"
                  class="mt-1 text-xs text-rose-600"
                >
                  {{ fieldError('feature_value') }}
                </p>
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
              <span class="font-mono">{{
                selectedPlanId ? adminPlanFeaturesEndpoint(selectedPlanId) : '?'
              }}</span>
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
                Edit Feature
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Plan: {{ currentPlan?.name || '?' }}
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
                  >Feature Key *</label
                >
                <input
                  v-model="editDraft.feature_key"
                  type="text"
                  :class="[
                    'w-full px-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40',
                    hasEditFieldError('feature_key') &&
                      'border-rose-500 dark:border-rose-500 focus:ring-rose-400',
                  ]"
                  placeholder="e.g. ai_writing"
                />
                <p
                  v-if="editFieldError('feature_key')"
                  class="mt-1 text-xs text-rose-600"
                >
                  {{ editFieldError('feature_key') }}
                </p>
              </div>
              <div>
                <label
                  class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                  >Value Type</label
                >
                <select
                  v-model="editDraft.valueType"
                  class="w-full px-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40"
                >
                  <option value="boolean">boolean</option>
                  <option value="number">number</option>
                  <option value="unlimited">unlimited</option>
                  <option value="text">text</option>
                </select>
              </div>
              <div v-if="editDraft.valueType === 'boolean'">
                <label
                  class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                  >Value</label
                >
                <select
                  v-model="editDraft.feature_value"
                  class="w-full px-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40"
                >
                  <option :value="true">true</option>
                  <option :value="false">false</option>
                </select>
              </div>
              <div v-else-if="editDraft.valueType === 'number'">
                <label
                  class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                  >Value</label
                >
                <input
                  v-model.number="editDraft.feature_value"
                  type="number"
                  :class="[
                    'w-full px-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40',
                    hasEditFieldError('feature_value') &&
                      'border-rose-500 dark:border-rose-500 focus:ring-rose-400',
                  ]"
                  placeholder="e.g. 10"
                />
                <p
                  v-if="editFieldError('feature_value')"
                  class="mt-1 text-xs text-rose-600"
                >
                  {{ editFieldError('feature_value') }}
                </p>
              </div>
              <div v-else-if="editDraft.valueType === 'unlimited'">
                <label
                  class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                  >Value</label
                >
                <input
                  value="unlimited"
                  disabled
                  class="w-full px-4 py-2 text-sm rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500"
                />
              </div>
              <div v-else>
                <label
                  class="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-2"
                  >Value</label
                >
                <input
                  v-model="editDraft.feature_value"
                  type="text"
                  :class="[
                    'w-full px-4 py-2 text-sm rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-mint/40',
                    hasEditFieldError('feature_value') &&
                      'border-rose-500 dark:border-rose-500 focus:ring-rose-400',
                  ]"
                  placeholder="e.g. true"
                />
                <p
                  v-if="editFieldError('feature_value')"
                  class="mt-1 text-xs text-rose-600"
                >
                  {{ editFieldError('feature_value') }}
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
                @click="updateFeature"
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
