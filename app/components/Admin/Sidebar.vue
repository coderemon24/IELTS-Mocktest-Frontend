<script setup lang="ts">
type SubMenuItem = {
  name: string
  route?: string
  subMenus?: SubMenuItem[]
}

type MenuItem = {
  name: string
  icon: string
  route?: string
  subMenus?: SubMenuItem[]
}

defineProps<{
  isOpen: boolean
  activeSubMenu: string | null
  activeNestedSubMenu: string | null
}>()

const emit = defineEmits<{
  (e: 'toggleSubMenu', name: string): void
  (e: 'toggleNestedSubMenu', name: string): void
}>()

const menuItems: MenuItem[] = [
  { name: 'Dashboard', icon: 'home', route: '/admin' },
  {
    name: 'Exams',
    icon: 'document-text',
    subMenus: [
      {
        name: 'Listening',
        subMenus: [
          { name: 'Listening Exams', route: '/admin/exams/listening' },
          { name: 'Exam Sections', route: '/admin/exams/listening/sections' },
          { name: 'Questions', route: '/admin/exams/listening/questions' },
        ],
      },
      { name: 'Writing', route: '/admin/exams/writing' },
      { name: 'Speaking', route: '/admin/exams/speaking' },
      { name: 'Reading', route: '/admin/exams/reading' },
    ],
  },
  {
    name: 'Packages',
    icon: 'package',
    subMenus: [
      { name: 'Plans', route: '/admin/packages/plans' },
      { name: 'Features', route: '/admin/packages/features' },
    ],
  },
  { name: 'Students', icon: 'users', route: '/admin/students' },
  { name: 'Results', icon: 'chart-bar', route: '/admin/results' },
  {
    name: 'Users',
    icon: 'user-group',
    subMenus: [
      { name: 'All Users', route: '/admin/users' },
      { name: 'Roles', route: '/admin/users/roles' },
    ],
  },
  { name: 'Settings', icon: 'cog', route: '/admin/settings' },
]

import { h } from "vue";
const Icons = {
  home: {
    render: () =>
      h(
        "svg",
        {
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          "stroke-width": 2,
        },
        [
          h("path", {
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6",
          }),
        ],
      ),
  },
  "document-text": {
    render: () =>
      h(
        "svg",
        {
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          "stroke-width": 2,
        },
        [
          h("path", {
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 011.414.586l5.414 5.414a1 1 0 01.586 1.414V19a2 2 0 01-2 2z",
          }),
        ],
      ),
  },
  users: {
    render: () =>
      h(
        "svg",
        {
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          "stroke-width": 2,
        },
        [
          h("path", {
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            d: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z",
          }),
        ],
      ),
  },
  "chart-bar": {
    render: () =>
      h(
        "svg",
        {
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          "stroke-width": 2,
        },
        [
          h("path", {
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            d: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
          }),
        ],
      ),
  },
  "user-group": {
    render: () =>
      h(
        "svg",
        {
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          "stroke-width": 2,
        },
        [
          h("path", {
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
          }),
        ],
      ),
  },
  cog: {
    render: () =>
      h(
        "svg",
        {
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          "stroke-width": 2,
        },
        [
          h("path", {
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            d: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z",
          }),
          h("path", {
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            d: "M15 12a3 3 0 11-6 0 3 3 0 016 0z",
          }),
        ],
      ),
  },
  package: {
    render: () =>
      h(
        "svg",
        {
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          "stroke-width": 2,
        },
        [
          h("path", {
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            d: "M21 16V8a2 2 0 00-1-1.732l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.732l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z",
          }),
          h("path", {
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            d: "M3.27 6.96L12 12l8.73-5.04M12 22V12",
          }),
        ],
      ),
  },
};
const getIcon = (name: string) =>
  Icons[name as keyof typeof Icons] || Icons.home;

const nestedKey = (parent: string, child: string) => `${parent}::${child}`
</script>

<template>
  <aside
    :class="['bg-navy dark:bg-slate-800 text-white flex flex-col transition-all duration-300 shadow-xl z-20 relative overflow-hidden', isOpen ? 'w-64' : 'w-20']"
  >
    <div
      class="flex overflow-hidden h-20 border-b border-white/10 items-center justify-center relative shrink-0"
    >
      <div v-if="isOpen" class="flex whitespace-nowrap items-center gap-2">
        <div
          class="flex w-8 h-8 text-navy font-bold text-xl bg-mint rounded-lg items-center justify-center"
        >
          I
        </div>
        <span class="text-2xl font-bold tracking-tight"
          >IELTS<span class="text-mint">BD</span></span
        >
      </div>
      <div v-else class="text-2xl font-bold text-mint">I</div>
      <div
        class="w-24 h-24 bg-mint/20 rounded-full absolute -top-10 -left-10 blur-2xl"
      ></div>
    </div>

    <div class="flex-1 overflow-y-auto py-6 space-y-2 custom-scrollbar">
      <template v-for="(item, index) in menuItems" :key="index">
        <div v-if="!item.subMenus">
          <NuxtLink
            v-if="item.route?.startsWith('/')"
            :to="item.route"
            class="flex px-6 py-3 text-slate-300 transition-colors relative 
            items-center hover:text-white hover:bg-white/10 group"
            active-class="text-mint bg-white/10 border-r-4 border-mint"
          >
            <component
              :is="getIcon(item.icon)"
              class="w-6 h-6 transition-transform shrink-0 group-hover:scale-110"
            />
            <span v-if="isOpen" class="ml-3 font-medium whitespace-nowrap">{{
              item.name
            }}</span>

            <div
              v-if="!isOpen"
              class="absolute left-16 z-50 px-2 py-1 text-white text-xs whitespace-nowrap bg-slate-800 border border-white/10 rounded opacity-0 pointer-events-none group-hover:opacity-100 transition shadow-lg"
            >
              {{ item.name }}
            </div>
          </NuxtLink>

          <a
            v-else
            :href="item.route"
            class="flex px-6 py-3 text-slate-300 transition-colors relative 
            items-center hover:text-white hover:bg-white/10 group"
          >
            <component
              :is="getIcon(item.icon)"
              class="w-6 h-6 transition-transform shrink-0 group-hover:scale-110"
            />
            <span v-if="isOpen" class="ml-3 font-medium whitespace-nowrap">{{
              item.name
            }}</span>

            <div
              v-if="!isOpen"
              class="absolute left-16 z-50 px-2 py-1 text-white text-xs whitespace-nowrap bg-slate-800 border border-white/10 rounded opacity-0 pointer-events-none group-hover:opacity-100 transition shadow-lg"
            >
              {{ item.name }}
            </div>
          </a>
        </div>

        <div v-else>
          <button
            @click="emit('toggleSubMenu', item.name)"
            class="flex w-full px-6 py-3 text-slate-300 transition-colors relative items-center justify-between hover:text-white hover:bg-white/10 group"
          >
            <div class="flex items-center">
              <component :is="getIcon(item.icon)" class="w-6 h-6 shrink-0" />
              <span v-if="isOpen" class="ml-3 font-medium whitespace-nowrap">{{
                item.name
              }}</span>
            </div>
            
            <svg
              v-if="isOpen"
              :class="['w-4 h-4 transition-transform', activeSubMenu === item.name ? 'rotate-180' : '']"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>

            <div
              v-if="!isOpen"
              class="absolute left-16 z-50 px-2 py-1 text-white text-xs
               whitespace-nowrap bg-slate-800 border border-white/10 
               rounded opacity-0 pointer-events-none group-hover:opacity-100 transition shadow-lg"
            >
              {{ item.name }}
            </div>
          </button>

          <div
            v-if="isOpen && activeSubMenu === item.name"
            class="py-2 bg-navy-dark dark:bg-slate-900/50"
          >
            <template v-for="sub in item.subMenus" :key="sub.name">
              <NuxtLink
                v-if="!sub.subMenus"
                :to="sub.route"
                class="flex pl-14 pr-6 py-2 text-sm text-slate-400 whitespace-nowrap items-center hover:text-mint hover:bg-white/5 transition"
                active-class="text-mint bg-white/5"
              >
                <span class="w-1.5 h-1.5 mr-2 bg-current rounded-full"></span>
                {{ sub.name }}
              </NuxtLink>

              <div v-else class="select-none">
                <button
                  class="flex w-full pl-14 pr-6 py-2 text-sm text-slate-300 whitespace-nowrap items-center justify-between hover:text-white hover:bg-white/5 transition"
                  @click="emit('toggleNestedSubMenu', nestedKey(item.name, sub.name))"
                >
                  <div class="flex items-center">
                    <span class="w-1.5 h-1.5 mr-2 bg-current rounded-full"></span>
                    {{ sub.name }}
                  </div>
                  <svg
                    class="w-4 h-4 transition-transform"
                    :class="[activeNestedSubMenu === nestedKey(item.name, sub.name) ? 'rotate-180' : '']"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                <div
                  v-if="activeNestedSubMenu === nestedKey(item.name, sub.name)"
                  class="pb-2"
                >
                  <NuxtLink
                    v-for="nested in sub.subMenus"
                    :key="nested.name"
                    :to="nested.route"
                    class="flex pl-[4.5rem] pr-6 py-2 text-[13px] text-slate-400 whitespace-nowrap items-center hover:text-mint hover:bg-white/5 transition"
                    active-class="text-mint bg-white/5"
                  >
                    <span class="w-1 h-1 mr-2 bg-current rounded-full opacity-70"></span>
                    {{ nested.name }}
                  </NuxtLink>
                </div>
              </div>
            </template>
          </div>
        </div>
      </template>
    </div>

    <div
      class="overflow-hidden p-4 text-xs text-center text-slate-400 border-t border-white/10 shrink-0"
    >
      <p
        v-if="isOpen"
        class="whitespace-nowrap transition-opacity duration-300"
      >
        v2.0.1 Admin
      </p>
      <p v-else class="text-mint font-bold tracking-tighter">V2</p>
    </div>
  </aside>
</template>

<style scoped>
.custom-scrollbar {
  overflow-x: hidden !important;
}
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}
</style>
