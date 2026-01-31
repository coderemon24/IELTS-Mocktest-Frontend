<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

const modules = [
  {
    name: 'Listening',
    description: 'Manage listening exams, sections, and questions.',
    to: '/admin/exams/listening',
    icon: 'speaker-wave',
    accent: 'bg-mint/10 text-mint',
  },
  {
    name: 'Reading',
    description: 'Manage reading exams (coming soon).',
    to: '/admin/exams/reading',
    icon: 'book-open',
    accent: 'bg-blue-500/10 text-blue-500',
  },
  {
    name: 'Writing',
    description: 'Manage writing exams (coming soon).',
    to: '/admin/exams/writing',
    icon: 'pencil-square',
    accent: 'bg-orange-500/10 text-orange-500',
  },
  {
    name: 'Speaking',
    description: 'Manage speaking exams (coming soon).',
    to: '/admin/exams/speaking',
    icon: 'microphone',
    accent: 'bg-purple-500/10 text-purple-500',
  },
]
</script>

<template>
  <div class="space-y-6">
    <div
      class="bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800"
    >
      <h1 class="text-xl font-bold text-navy dark:text-white">Exams</h1>
      <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">
        Choose a module to manage exams and content.
      </p>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <NuxtLink
        v-for="m in modules"
        :key="m.name"
        :to="m.to"
        class="group bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm hover:border-mint transition-colors"
      >
        <div class="flex items-center gap-3">
          <div
            :class="['p-3 rounded-xl shrink-0 transition-transform group-hover:scale-110', m.accent]"
          >
            <Icon :name="`heroicons:${m.icon}`" class="w-5 h-5" />
          </div>
          <div class="min-w-0">
            <p class="text-sm font-bold text-navy dark:text-white truncate">
              {{ m.name }}
            </p>
            <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
              {{ m.description }}
            </p>
          </div>
        </div>
      </NuxtLink>
    </div>
  </div>
</template>

