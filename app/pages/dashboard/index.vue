<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
import gsap from 'gsap'

// Register ChartJS
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

// Chart Configuration
const chartData = {
  labels: ['Listening', 'Reading', 'Writing', 'Speaking'],
  datasets: [{
    label: 'Last Mock Score',
    backgroundColor: ['#1B365D', '#5DADE2', '#F39C12', '#2ECC71'], // Navy, Blue, Orange, Green
    borderRadius: 6,
    data: [7.5, 8.0, 6.5, 7.0]
  }]
}

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false }
  },
  scales: {
    y: { beginAtZero: true, max: 9 }
  }
}

onMounted(() => {
  // Staggered Entrance Animation
  gsap.from('.anim-card', { 
    y: 30, 
    opacity: 0, 
    stagger: 0.1, 
    duration: 0.8, 
    ease: 'power2.out' 
  })
})
</script>

<template>
  <div class="min-h-screen bg-offwhite p-6 md:p-8 font-sans">
    
    <header class="flex justify-between items-center mb-8 anim-card">
      <div>
        <h1 class="text-3xl font-bold text-navy">Welcome back, Rahim 👋</h1>
        <p class="text-slate-500">You are 0.5 bands away from your target.</p>
      </div>
      <div class="hidden md:block text-right">
        <p class="text-sm font-bold text-navy">Target: Canada (CLB 9)</p>
        <p class="text-xs text-slate-400">Exam Date: Oct 24, 2024</p>
      </div>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      <div class="lg:col-span-2 space-y-8">
        
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 anim-card">
            <p class="text-xs text-slate-400 uppercase font-bold">Overall Band</p>
            <p class="text-3xl font-bold text-navy mt-1">7.5</p>
          </div>
          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 anim-card">
            <p class="text-xs text-slate-400 uppercase font-bold">Tests Taken</p>
            <p class="text-3xl font-bold text-orange mt-1">12</p>
          </div>
          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 anim-card">
            <p class="text-xs text-slate-400 uppercase font-bold">Writing Avg</p>
            <p class="text-3xl font-bold text-mint mt-1">6.5</p>
          </div>
          <div class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 anim-card">
            <p class="text-xs text-slate-400 uppercase font-bold">Speaking Avg</p>
            <p class="text-3xl font-bold text-blue-500 mt-1">7.0</p>
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 anim-card">
          <div class="flex justify-between items-center mb-6">
            <h3 class="font-bold text-navy text-lg">Performance Analytics</h3>
            <select class="text-sm border-gray-200 rounded-lg text-slate-500 bg-gray-50 p-2">
              <option>Last 5 Tests</option>
              <option>This Month</option>
            </select>
          </div>
          <div class="h-64">
            <Bar :data="chartData" :options="chartOptions" />
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 anim-card">
          <h3 class="font-bold text-navy text-lg mb-4">Recent Activity</h3>
          <div class="space-y-4">
            <div class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-full bg-orange/10 flex items-center justify-center text-orange font-bold">W</div>
                <div>
                  <p class="font-bold text-navy text-sm">Writing Task 2: Education</p>
                  <p class="text-xs text-slate-400">2 hours ago</p>
                </div>
              </div>
              <span class="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Band 6.5</span>
            </div>
            <div class="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition">
              <div class="flex items-center gap-4">
                <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-navy font-bold">L</div>
                <div>
                  <p class="font-bold text-navy text-sm">Full Listening Mock #04</p>
                  <p class="text-xs text-slate-400">Yesterday</p>
                </div>
              </div>
              <span class="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">Band 8.0</span>
            </div>
          </div>
        </div>

      </div>

      <div class="space-y-8">
        
        <div class="anim-card relative overflow-hidden rounded-2xl shadow-xl group">
          <img 
            src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop" 
            alt="Exam Setup" 
            class="absolute inset-0 w-full h-full object-cover opacity-90 transition duration-700 group-hover:scale-105"
          />
          <div class="absolute inset-0 bg-gradient-to-b from-navy/40 to-navy/90"></div>
          
          <div class="relative z-10 p-8 flex flex-col h-full min-h-[300px] justify-between text-white">
            <div>
              <span class="bg-orange text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">Recommended</span>
              <h3 class="text-2xl font-bold mt-3 leading-tight">Mock Test #12 is ready</h3>
              <p class="text-sm text-slate-200 mt-2 opacity-80">Full computer-delivered simulation. 2h 45m.</p>
            </div>
            
            <NuxtLink to="/exam/start" class="w-full bg-white text-navy font-bold py-3 rounded-lg text-center hover:bg-mint hover:text-white transition shadow-lg">
              Launch Simulator 🚀
            </NuxtLink>
          </div>
        </div>

        <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 anim-card">
          <h3 class="font-bold text-navy mb-4">Quick Practice</h3>
          <div class="grid grid-cols-2 gap-4">
            <button class="p-4 rounded-xl border border-gray-100 hover:border-orange hover:bg-orange/5 transition text-center group">
              <span class="text-2xl mb-2 block group-hover:scale-110 transition">🎧</span>
              <span class="text-xs font-bold text-slate-600">Listening</span>
            </button>
            <button class="p-4 rounded-xl border border-gray-100 hover:border-orange hover:bg-orange/5 transition text-center group">
              <span class="text-2xl mb-2 block group-hover:scale-110 transition">📖</span>
              <span class="text-xs font-bold text-slate-600">Reading</span>
            </button>
            <button class="p-4 rounded-xl border border-gray-100 hover:border-orange hover:bg-orange/5 transition text-center group">
              <span class="text-2xl mb-2 block group-hover:scale-110 transition">✍️</span>
              <span class="text-xs font-bold text-slate-600">Writing</span>
            </button>
            <button class="p-4 rounded-xl border border-gray-100 hover:border-orange hover:bg-orange/5 transition text-center group">
              <span class="text-2xl mb-2 block group-hover:scale-110 transition">🗣️</span>
              <span class="text-xs font-bold text-slate-600">Speaking</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>