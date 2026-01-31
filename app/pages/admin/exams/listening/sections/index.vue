<script setup lang="ts">
import { computed, ref } from 'vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

const query = ref('')
const { sections, pending, error, refresh, endpoint } = useAdminListeningExams()

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return sections.value
  return sections.value.filter((s) => {
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
        <input
          v-model="query"
          type="text"
          placeholder="Search sections..."
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
              <th class="px-6 py-3">Audio</th>
              <th class="px-6 py-3">Order</th>
              <th class="px-6 py-3">Status</th>
              <th class="px-6 py-3 text-right">Questions</th>
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
                {{ s.audio || '—' }}
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
            </tr>

            <tr v-if="!pending && filtered.length === 0">
              <td
                class="px-6 py-10 text-center text-slate-500 dark:text-slate-400"
                colspan="6"
              >
                No sections found.
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
  </div>
</template>

