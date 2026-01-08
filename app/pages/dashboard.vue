<script setup lang="ts">
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
import gsap from 'gsap'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const chartData = {
  labels: ['Listening', 'Reading', 'Writing', 'Speaking'],
  datasets: [{
    label: 'Band Score',
    backgroundColor: ['#1B365D', '#1B365D', '#F39C12', '#2ECC71'],
    data: [7.5, 8.0, 6.0, 7.0]
  }]
}
const chartOptions = { responsive: true, maintainAspectRatio: false }

onMounted(() => {
  gsap.from('.stat-card', { opacity: 0, y: 20, stagger: 0.1, duration: 0.8 })
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h2 class="text-2xl font-bold text-navy mb-6">Student Dashboard</h2>
    
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="stat-card col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 class="font-bold text-gray-700 mb-4">Progress Analysis</h3>
        <div class="h-64">
          <Bar :data="chartData" :options="chartOptions" />
        </div>
      </div>
      
      <div class="stat-card bg-navy text-white p-6 rounded-xl shadow-lg flex flex-col justify-between">
        <div>
          <h3 class="text-xl font-bold">Start New Test</h3>
          <p class="text-navy-100 mt-2 text-sm">Full simulation (3 hours)</p>
        </div>
        <NuxtLink to="/exam/1" class="mt-4 bg-orange text-white text-center py-2 rounded font-bold hover:bg-orange-hover transition">
          Launch Simulator
        </NuxtLink>
      </div>
    </div>
  </div>
</template>