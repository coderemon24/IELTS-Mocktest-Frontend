<script setup lang="ts">
import { computed, ref } from 'vue'

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

const query = ref('')
const { questions, pending, error, refresh, endpoint } = useAdminListeningExams()

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
            </tr>

            <tr v-if="!pending && filtered.length === 0">
              <td
                class="px-6 py-10 text-center text-slate-500 dark:text-slate-400"
                colspan="6"
              >
                No questions found.
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

