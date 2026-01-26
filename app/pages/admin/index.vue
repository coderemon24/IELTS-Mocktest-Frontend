<script setup>

definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth',
})

// Stats data - More compact and informative
const stats = [
  { name: 'Total Visited', value: '45,289', change: '+12%', icon: 'chart-bar', color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { name: 'Active Users', value: '8,245', change: '+5%', icon: 'users', color: 'text-mint', bg: 'bg-mint/10' },
  { name: 'Total Exams', value: '1,156', change: '+24', icon: 'document-text', color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { name: 'Revenue', value: '$12.4k', change: '+18%', icon: 'currency-dollar', color: 'text-purple-500', bg: 'bg-purple-500/10' },
]

const packageStats = [
  { name: 'Basic', count: 450, percentage: 35, color: 'bg-slate-400' },
  { name: 'Standard', count: 820, percentage: 85, color: 'bg-mint' },
  { name: 'Premium', count: 340, percentage: 55, color: 'bg-orange-500' },
]
</script>

<template>
  <div class="p-4 md:p-6 space-y-6 bg-[#F8FAFC] dark:bg-slate-950 min-h-screen transition-colors duration-300 font-sans">
    
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200/60 dark:border-slate-800">
      <div>
        <h1 class="text-xl font-bold text-navy dark:text-white">Admin Overview</h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 font-medium">Monitoring IELTS BD performance in real-time.</p>
      </div>
      <div class="flex gap-2">
        <button class="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 transition">Reports</button>
        <button class="px-4 py-2 text-xs font-bold text-white bg-navy rounded-lg shadow-md shadow-navy/20 hover:bg-navy-light transition">+ New Exam</button>
      </div>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div v-for="stat in stats" :key="stat.name" 
        class="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm flex items-center gap-4 hover:border-mint transition-colors group">
        <div :class="['p-3 rounded-xl shrink-0 transition-transform group-hover:scale-110', stat.bg, stat.color]">
          <Icon :name="`heroicons:${stat.icon}`" class="w-5 h-5" />
        </div>
        <div>
          <p class="text-[10px] font-bold uppercase tracking-wider text-slate-400">{{ stat.name }}</p>
          <div class="flex items-baseline gap-2">
            <h3 class="text-lg font-bold text-navy dark:text-white">{{ stat.value }}</h3>
            <span class="text-[10px] font-bold text-green-500">{{ stat.change }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <div class="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-sm font-bold text-navy dark:text-white">User Engagement Traffic</h3>
          <select class="text-[10px] font-bold bg-slate-50 dark:bg-slate-800 border-none rounded-md px-2 py-1">
            <option>Monthly</option>
            <option>Weekly</option>
          </select>
        </div>

        <div class="relative h-48 w-full mt-4">
          <svg class="w-full h-full overflow-visible" viewBox="0 0 1000 100" preserveAspectRatio="none">
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" style="stop-color: #10b981; stop-opacity:0.2" />
                <stop offset="100%" style="stop-color: #10b981; stop-opacity:0" />
              </linearGradient>
            </defs>
            <path d="M0,80 Q100,20 200,60 T400,30 T600,70 T800,20 T1000,50 L1000,100 L0,100 Z" fill="url(#grad)" />
            <path d="M0,80 Q100,20 200,60 T400,30 T600,70 T800,20 T1000,50" 
                  fill="none" stroke="#10b981" stroke-width="3" stroke-linecap="round" class="animate-draw" />
            <circle v-for="(p, i) in [0, 200, 400, 600, 800, 1000]" :key="i" 
                    :cx="p" :cy="[80, 60, 30, 70, 20, 50][i]" r="4" fill="white" stroke="#10b981" stroke-width="2" />
          </svg>
          <div class="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-5 dark:opacity-10">
            <div class="w-full border-t border-navy dark:border-white"></div>
            <div class="w-full border-t border-navy dark:border-white"></div>
            <div class="w-full border-t border-navy dark:border-white"></div>
          </div>
        </div>
        <div class="flex justify-between mt-4 px-1 text-[9px] font-bold text-slate-400 uppercase">
          <span>Jan</span><span>Mar</span><span>May</span><span>Jul</span><span>Sep</span><span>Nov</span>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
        <h3 class="text-sm font-bold text-navy dark:text-white mb-6">Package Enrollment</h3>
        <div class="space-y-5">
          <div v-for="pkg in packageStats" :key="pkg.name" class="group">
            <div class="flex justify-between items-end mb-2">
              <span class="text-[10px] font-bold text-slate-500 uppercase">{{ pkg.name }}</span>
              <span class="text-xs font-bold text-navy dark:text-white">{{ pkg.percentage }}%</span>
            </div>
            <div class="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div :class="['h-full rounded-full transition-all duration-1000 group-hover:brightness-110', pkg.color]" :style="{ width: pkg.percentage + '%' }"></div>
            </div>
          </div>
        </div>

        <div class="mt-8 p-4 bg-navy dark:bg-slate-800 rounded-xl text-center relative overflow-hidden">
          <p class="text-[9px] font-bold text-mint uppercase tracking-widest">Growth</p>
          <h4 class="text-white text-sm font-bold mt-1">Standard Plan +12%</h4>
          <Icon name="heroicons:rocket-launch" class="absolute -right-2 -bottom-2 w-12 h-12 text-white/5" />
        </div>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-800 shadow-sm overflow-hidden">
      <div class="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
        <h3 class="text-sm font-bold text-navy dark:text-white">Recent Student Progress</h3>
        <NuxtLink to="/admin/students" class="text-[10px] font-bold text-blue-500 hover:underline">View All Students</NuxtLink>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead>
            <tr class="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 font-bold uppercase tracking-wider">
              <th class="px-6 py-3">Student</th>
              <th class="px-6 py-3">Exam Module</th>
              <th class="px-6 py-3">Last Activity</th>
              <th class="px-6 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
            <tr v-for="i in 4" :key="i" class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
              <td class="px-6 py-4 flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-mint/20 text-mint flex items-center justify-center font-bold">R</div>
                <div>
                  <p class="font-bold text-navy dark:text-white">Rahat Chowdhury</p>
                  <p class="text-[10px] text-slate-400">rahat@gmail.com</p>
                </div>
              </td>
              <td class="px-6 py-4 font-medium text-slate-600 dark:text-slate-300">IELTS Academic Mock #{{ i }}</td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <span class="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                  <span class="text-slate-400">Just now</span>
                </div>
              </td>
              <td class="px-6 py-4 text-right">
                <button class="text-slate-400 hover:text-navy dark:hover:text-white">
                  <Icon name="heroicons:chevron-right" class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-draw {
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  animation: draw 2s ease-out forwards;
}

@keyframes draw {
  to { stroke-dashoffset: 0; }
}
</style>