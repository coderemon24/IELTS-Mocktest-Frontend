<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import Chart from 'chart.js/auto'
import { gsap } from 'gsap'
import { useRouter } from 'vue-router'

import { useExamSystem } from '~/composables/useExamSystem'
const { userAnswers, initExam } = useExamSystem()
initExam('listening_part_1')

definePageMeta({
  layout: false,
  middleware: 'user-auth',
})

const router = useRouter()
const currentTask = ref<'task1' | 'task2'>('task1')
const showSubmitModal = ref(false)
const isSubmitting = ref(false)

const answers = reactive({
  task1: '',
  task2: ''
})

const leftPane = ref(null)
const rightPane = ref(null)
const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

// --- Chart Logic ---
const renderChart = () => {
  if (!chartCanvas.value) return
  if (chartInstance) chartInstance.destroy()

  chartInstance = new Chart(chartCanvas.value, {
    type: 'bar',
    data: {
      labels: ['2018', '2019', '2020', '2021', '2022'],
      datasets: [
        {
          label: 'Rice Production (Million Tonnes)',
          data: [36.2, 36.5, 37.4, 38.1, 39.2],
          backgroundColor: '#166534',
          borderRadius: 4
        },
        {
          label: 'Wheat Production (Million Tonnes)',
          data: [1.1, 1.2, 1.25, 1.1, 1.0], 
          backgroundColor: '#eab308',
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom' },
        title: { 
          display: true, 
          text: 'Agricultural Crop Production in Bangladesh (2018-2022)' 
        }
      }
    }
  })
}

// --- Word Counts ---
const task1Count = computed(() => answers.task1.trim() === '' ? 0 : answers.task1.trim().split(/\s+/).length)
const task2Count = computed(() => answers.task2.trim() === '' ? 0 : answers.task2.trim().split(/\s+/).length)

const activeWordCount = computed(() => {
  return currentTask.value === 'task1' ? task1Count.value : task2Count.value
})

// --- Task Switching ---
const switchTask = (task: 'task1' | 'task2') => {
  if (currentTask.value === task) return

  const tl = gsap.timeline({
    onComplete: () => {
      currentTask.value = task
      nextTick(() => {
        if (task === 'task1') renderChart()
        
        gsap.fromTo([leftPane.value, rightPane.value], 
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, stagger: 0.1, ease: 'power2.out' }
        )
      })
    }
  })

  tl.to([leftPane.value, rightPane.value], { y: -10, opacity: 0, duration: 0.3 })
}

// --- Submit Logic ---
const confirmSubmit = async () => {
  isSubmitting.value = true
  await new Promise(resolve => setTimeout(resolve, 2000))
  console.log('Submitted Answers:', answers)
  router.push('/') 
}

onMounted(() => {
  renderChart()
  gsap.from([leftPane.value, rightPane.value], { 
    y: 20, opacity: 0, duration: 0.6, stagger: 0.2, ease: 'power2.out' 
  })
})
</script>

<template>
  <NuxtLayout name="exam">
    <template #timer>
      <Timer :duration-minutes="60" />
    </template>

    <div class="flex flex-col h-screen w-full overflow-hidden relative pb-16">
      
      <div class="flex-grow flex flex-col md:flex-row divide-x divide-gray-200 min-h-0 overflow-hidden">
        
        <div ref="leftPane" class="w-full md:w-1/2 h-full overflow-y-auto bg-white p-8 custom-scroll pb-24">
          <div v-if="currentTask === 'task1'" class="space-y-6">
            <div class="bg-blue-50 border-l-4 border-blue-600 p-4">
              <h3 class="font-bold text-gray-800">Task 1: Report Writing</h3>
              <p class="text-sm text-gray-600 mt-1">
                The chart below shows the production of Rice and Wheat in Bangladesh from 2018 to 2022. 
                Summarize the information by selecting and reporting the main features, and make comparisons where relevant.
              </p>
              <p class="text-xs font-semibold text-gray-500 mt-2">Write at least 150 words.</p>
            </div>
            <div class="h-80 w-full bg-white border rounded p-4 shadow-sm">
              <canvas ref="chartCanvas"></canvas>
            </div>
          </div>

          <div v-else class="space-y-6">
            <div class="bg-orange-50 border-l-4 border-orange-600 p-4">
              <h3 class="font-bold text-gray-800">Task 2: Essay Writing</h3>
              <p class="text-sm text-gray-600 mt-1">
                Give reasons for your answer and include any relevant examples from your own knowledge or experience.
              </p>
              <p class="text-xs font-semibold text-gray-500 mt-2">Write at least 250 words.</p>
            </div>
            <div class="p-6 border-2 border-dashed border-gray-300 rounded-lg">
              <p class="text-lg font-serif text-gray-800 leading-relaxed">
                "Rapid urbanization in cities like Dhaka has led to severe traffic congestion and environmental pollution. 
                Some people believe that the best solution is to decentralize the government and move industries to rural areas."
              </p>
              <p class="mt-4 font-bold text-gray-700">To what extent do you agree or disagree with this statement?</p>
            </div>
          </div>
        </div>

        <div ref="rightPane" class="w-full md:w-1/2 h-full bg-gray-50 flex flex-col min-h-0">
          <div class="bg-white border-b px-6 py-3 flex justify-between items-center shadow-sm z-10 shrink-0">
            <span class="font-bold text-navy uppercase tracking-wider text-sm">
              {{ currentTask === 'task1' ? 'Your Report' : 'Your Essay' }}
            </span>
            <div class="flex items-center gap-2 text-sm">
              <span class="text-gray-500">Word Count:</span>
              <span 
                class="font-mono font-bold px-2 py-1 rounded transition-colors duration-300"
                :class="{
                  'bg-red-100 text-red-600': (currentTask === 'task1' && activeWordCount < 150) || (currentTask === 'task2' && activeWordCount < 250),
                  'bg-green-100 text-green-600': (currentTask === 'task1' && activeWordCount >= 150) || (currentTask === 'task2' && activeWordCount >= 250)
                }"
              >
                {{ activeWordCount }}
              </span>
            </div>
          </div>

          <div class="flex-grow p-6 overflow-hidden">
            <textarea 
              v-if="currentTask === 'task1'"
              v-model="answers.task1"
              class="w-full h-[32rem] p-4 text-lg leading-relaxed text-gray-800 bg-white border border-gray-300 rounded resize-none focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy custom-scroll font-serif pb-20"
              placeholder="Start typing your report here..."
            ></textarea>
            
            <textarea 
              v-else
              v-model="answers.task2" 
              class="w-full h-[32rem] p-4 text-lg leading-relaxed text-gray-800 bg-white border border-gray-300 rounded resize-none focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy custom-scroll font-serif pb-20"
              placeholder="Start typing your essay here..."
            ></textarea>
          </div>
        </div>
      </div>

      <div class="fixed bottom-0 left-0 right-0 h-16 bg-white border-t flex items-center justify-between px-6 z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        <div class="flex gap-4">
          <button @click="switchTask('task1')" class="flex flex-col items-center justify-center w-32 h-12 rounded transition-all duration-200" :class="currentTask === 'task1' ? 'bg-navy text-white shadow-lg transform -translate-y-1' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'">
            <span class="text-xs font-bold uppercase">Task 1</span>
            <span class="text-[10px] opacity-80">Graph</span>
          </button>
          <button @click="switchTask('task2')" class="flex flex-col items-center justify-center w-32 h-12 rounded transition-all duration-200" :class="currentTask === 'task2' ? 'bg-navy text-white shadow-lg transform -translate-y-1' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'">
            <span class="text-xs font-bold uppercase">Task 2</span>
            <span class="text-[10px] opacity-80">Essay</span>
          </button>
        </div>

        <button 
          @click="showSubmitModal = true"
          class="bg-green-600 hover:bg-green-700 text-white px-8 py-2 rounded font-bold shadow transition-colors flex items-center gap-2"
        >
          Submit Exam
        </button>
      </div>
      
      <div v-if="showSubmitModal" class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div class="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden">
          <div class="bg-navy p-4 text-white">
            <h3 class="text-xl font-bold">Confirm Submission</h3>
            <p class="text-sm opacity-80">Are you sure you want to finish the exam?</p>
          </div>

          <div class="p-6">
            <div class="space-y-4">
              <div class="flex justify-between items-center p-3 bg-gray-50 rounded border">
                <div>
                  <span class="font-bold text-gray-700 block">Task 1 (Report)</span>
                  <span class="text-xs text-gray-500">Min: 150 words</span>
                </div>
                <span :class="task1Count >= 150 ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'" class="px-3 py-1 rounded font-mono font-bold">
                  {{ task1Count }} words
                </span>
              </div>
              <div class="flex justify-between items-center p-3 bg-gray-50 rounded border">
                <div>
                  <span class="font-bold text-gray-700 block">Task 2 (Essay)</span>
                  <span class="text-xs text-gray-500">Min: 250 words</span>
                </div>
                <span :class="task2Count >= 250 ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'" class="px-3 py-1 rounded font-mono font-bold">
                  {{ task2Count }} words
                </span>
              </div>
            </div>

            <div v-if="task1Count < 150 || task2Count < 250" class="mt-4 p-3 bg-yellow-50 text-yellow-800 text-sm rounded border border-yellow-200 flex items-start gap-2">
              <span class="text-xl">⚠️</span>
              <p>You have not reached the minimum word count. This may affect your score.</p>
            </div>
          </div>

          <div class="p-4 bg-gray-50 border-t flex justify-end gap-3">
            <button @click="showSubmitModal = false" :disabled="isSubmitting" class="px-4 py-2 rounded text-gray-600 hover:bg-gray-200 font-bold transition-colors disabled:opacity-50">
              Keep Writing
            </button>
            <button @click="confirmSubmit" :disabled="isSubmitting" class="px-6 py-2 rounded bg-green-600 hover:bg-green-700 text-white font-bold shadow transition-colors flex items-center gap-2 disabled:opacity-70">
              <span v-if="isSubmitting" class="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
              {{ isSubmitting ? 'Submitting...' : 'Yes, Submit' }}
            </button>
          </div>
        </div>
      </div>

    </div>
  </NuxtLayout>
</template>

<style scoped>
.custom-scroll::-webkit-scrollbar {
  width: 8px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: #f1f1f1;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>
