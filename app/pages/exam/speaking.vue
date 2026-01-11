<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { gsap } from 'gsap'
import { useRouter } from 'vue-router'

// লেআউট ডিজেবল করে কাস্টম লেআউট ব্যবহার করা হচ্ছে
definePageMeta({ layout: false })

const router = useRouter()
const currentStep = ref(0)
const isRecording = ref(false)
const isPreparing = ref(false)
const audioLevel = ref(0)
const leftPane = ref<HTMLElement | null>(null)
const rightPane = ref<HTMLElement | null>(null)

let audioInterval: any = null
let timerInterval: any = null
const timerSeconds = ref(0)

// --- Mock Data ---
const speakingParts = [
  {
    id: 1,
    title: 'Part 1: Introduction & Interview',
    instruction: 'The examiner asks you general questions about yourself, your home, work, studies and familiar topics.',
    questions: [
      'Can you tell me your full name?',
      'Do you work or are you a student?',
      'What do you like most about your hometown?',
      'Do you prefer to spend time with family or friends?'
    ],
    duration: '4-5 Minutes'
  },
  {
    id: 2,
    title: 'Part 2: Individual Long Turn (Cue Card)',
    instruction: 'You have 1 minute to prepare and then you must speak for up to 2 minutes on the topic below.',
    topic: {
      title: 'Describe a memorable journey you have taken.',
      points: [
        'Where you went',
        'How you traveled',
        'Who you went with',
        'And explain why this journey was memorable to you.'
      ]
    },
    duration: '3-4 Minutes'
  },
  {
    id: 3,
    title: 'Part 3: Discussion',
    instruction: 'The examiner asks you deeper questions related to the topic in Part 2.',
    questions: [
      'How has transportation changed in your country over the last few decades?',
      'Do you think people travel more now than in the past?',
      'What are the environmental impacts of tourism?'
    ],
    duration: '4-5 Minutes'
  }
]

const currentPartData = computed(() => speakingParts[currentStep.value])
const isLastPart = computed(() => currentStep.value === speakingParts.length - 1)

// --- Timer Helper ---
const formattedTimer = computed(() => {
  const mins = Math.floor(timerSeconds.value / 60).toString().padStart(2, '0')
  const secs = (timerSeconds.value % 60).toString().padStart(2, '0')
  return `${mins}:${secs}`
})

// --- Audio Logic ---
const startRecording = () => {
  isRecording.value = true
  isPreparing.value = false
  timerSeconds.value = 0
  
  // Audio Visualizer Simulation
  audioInterval = setInterval(() => {
    audioLevel.value = Math.random() * 100
  }, 100)

  // Timer Counter
  timerInterval = setInterval(() => {
    timerSeconds.value++
  }, 1000)
}

const stopRecording = () => {
  isRecording.value = false
  clearInterval(audioInterval)
  clearInterval(timerInterval)
  audioLevel.value = 0
}

const toggleRecording = () => {
  if (isRecording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

// --- Navigation Logic ---
const nextPart = () => {
  stopRecording()
  
  const tl = gsap.timeline({
    onComplete: () => {
      if (currentStep.value < speakingParts.length - 1) {
        currentStep.value++
        timerSeconds.value = 0
        
        // Animation Enter
        nextTick(() => {
           if (leftPane.value && rightPane.value) {
             gsap.fromTo([leftPane.value, rightPane.value], 
               { y: 20, opacity: 0 },
               { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power2.out' }
             )
           }
        })
      } else {
        // Finish Exam
        router.push('/')
      }
    }
  })

  if (leftPane.value && rightPane.value) {
    tl.to([leftPane.value, rightPane.value], { y: -10, opacity: 0, duration: 0.3 })
  }
}

const startPreparation = () => {
  isPreparing.value = true
  timerSeconds.value = 60 // 1 minute countdown
  
  // Clear any existing intervals
  clearInterval(timerInterval)
  
  timerInterval = setInterval(() => {
    if (timerSeconds.value > 0) {
      timerSeconds.value--
    } else {
      clearInterval(timerInterval)
      isPreparing.value = false
    }
  }, 1000)
}

// --- Lifecycle Hooks ---
onMounted(() => {
  if (leftPane.value && rightPane.value) {
    gsap.from([leftPane.value, rightPane.value], { 
      y: 20, opacity: 0, duration: 0.6, stagger: 0.2, ease: 'power2.out' 
    })
  }
})

onUnmounted(() => {
  clearInterval(audioInterval)
  clearInterval(timerInterval)
})
</script>

<template>
  <NuxtLayout name="exam">
    <template #timer>
      <Timer :duration-minutes="15" />
    </template>

    <div class="flex flex-col h-screen w-full overflow-hidden relative pb-20">
      
      <div class="flex-grow flex flex-col md:flex-row divide-x divide-gray-200 min-h-0 overflow-hidden">
        
        <div ref="leftPane" class="w-full md:w-1/2 h-full overflow-y-auto bg-white p-8 custom-scroll pb-24">
          <div class="mb-8">
            <span class="inline-block px-3 py-1 bg-navy/10 text-navy rounded-full text-xs font-bold tracking-wider mb-2">
              {{ currentPartData.duration }}
            </span>
            <h2 class="text-2xl font-bold text-gray-800">{{ currentPartData.title }}</h2>
            <p class="text-gray-600 mt-2">{{ currentPartData.instruction }}</p>
          </div>

          <div v-if="currentPartData.id !== 2" class="space-y-6">
            <div class="bg-blue-50 border-l-4 border-blue-500 p-5 rounded-r-lg">
              <h3 class="font-bold text-gray-700 mb-3 flex items-center gap-2">
                Examiner's Questions
              </h3>
              <ul class="space-y-3">
                <li v-for="(q, idx) in currentPartData.questions" :key="idx" class="flex gap-3 text-gray-800">
                  <span class="font-bold text-blue-600">{{ idx + 1 }}.</span>
                  <span class="font-serif text-lg">{{ q }}</span>
                </li>
              </ul>
            </div>
          </div>

          <div v-else class="space-y-6">
             <div class="border-2 border-gray-800 p-8 rounded-lg shadow-sm bg-gray-50 relative overflow-hidden">
               <div class="absolute top-0 right-0 bg-gray-200 px-4 py-1 text-xs font-bold text-gray-600 rounded-bl-lg">CUE CARD</div>
               <h3 class="text-xl font-bold text-gray-900 mb-4">{{ currentPartData.topic.title }}</h3>
               <p class="text-gray-600 mb-4 text-sm font-semibold uppercase tracking-wide">You should say:</p>
               <ul class="space-y-2 list-disc list-inside text-gray-800 font-serif text-lg">
                 <li v-for="(point, idx) in currentPartData.topic.points" :key="idx">{{ point }}</li>
               </ul>
             </div>
             
             <div v-if="!isRecording && !isPreparing" class="flex items-center gap-3 p-4 bg-yellow-50 text-yellow-800 rounded border border-yellow-200">
               <div>
                 <p class="font-bold">Preparation Time</p>
                 <p class="text-sm">You have 1 minute to make notes before you speak.</p>
               </div>
               <button @click="startPreparation" class="ml-auto bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded text-sm font-bold transition-colors">
                 Start Timer
               </button>
             </div>
          </div>
        </div>

        <div ref="rightPane" class="w-full md:w-1/2 h-full bg-gray-900 flex flex-col items-center justify-center relative overflow-hidden">
          
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black opacity-50"></div>
          
          <div class="z-10 text-center mb-12">
            <div v-if="isPreparing" class="text-yellow-400 text-2xl font-bold animate-pulse mb-2">Preparing...</div>
            <div v-else-if="isRecording" class="text-red-500 text-2xl font-bold animate-pulse mb-2 flex items-center justify-center gap-2">
              <span class="w-3 h-3 bg-red-500 rounded-full"></span> Recording
            </div>
            <div v-else class="text-gray-400 text-xl">Ready to Answer</div>
            
            <div class="font-mono text-5xl text-white font-bold tracking-widest mt-4">
              <span :class="{'text-yellow-400': isPreparing, 'text-red-500': isRecording}">
                {{ formattedTimer }}
              </span>
            </div>
          </div>

          <div class="h-32 flex items-center justify-center gap-1.5 z-10 w-full px-20">
             <div 
               v-for="i in 20" 
               :key="i"
               class="w-3 rounded-full transition-all duration-75 ease-in-out"
               :class="isRecording ? 'bg-gradient-to-t from-red-500 to-orange-400' : 'bg-gray-700'"
               :style="{ 
                 height: isRecording ? Math.max(10, Math.random() * 100) + '%' : '4px',
                 opacity: isRecording ? 1 : 0.5
               }"
             ></div>
          </div>

          <div class="mt-12 flex flex-col items-center z-10">
            <button 
              @click="toggleRecording"
              class="w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 transform hover:scale-105 border-4"
              :class="isRecording 
                ? 'bg-red-600 border-red-400 shadow-[0_0_40px_rgba(220,38,38,0.6)] hover:bg-red-700' 
                : 'bg-white border-gray-200 hover:bg-gray-100'"
            >
              <svg v-if="isRecording" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" class="w-10 h-10 drop-shadow-md">
                <path fill-rule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clip-rule="evenodd" />
              </svg>
              
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-10 h-10 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
            
            <p class="mt-4 text-sm font-bold tracking-[0.2em] uppercase transition-colors"
               :class="isRecording ? 'text-red-500 animate-pulse' : 'text-gray-400'">
              {{ isRecording ? 'Click to Stop' : 'Tap to Speak' }}
            </p>
          </div>

        </div>
      </div>

      <div class="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-gray-200 flex items-center justify-between px-8 z-50 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div class="flex items-center gap-2">
          <div v-for="(part, idx) in speakingParts" :key="part.id" class="flex items-center">
            <div 
              class="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors duration-300"
              :class="currentStep === idx ? 'bg-navy text-white border-navy' : (currentStep > idx ? 'bg-green-100 text-green-600 border-green-600' : 'bg-white text-gray-300 border-gray-200')"
            >
              {{ currentStep > idx ? '✓' : idx + 1 }}
            </div>
            <div v-if="idx < speakingParts.length - 1" class="w-8 h-0.5 mx-1" :class="currentStep > idx ? 'bg-green-500' : 'bg-gray-200'"></div>
          </div>
        </div>

        <div class="flex gap-4">
           <button 
             v-if="currentStep > 0"
             @click="currentStep--"
             class="px-6 py-2.5 rounded border border-gray-300 text-gray-600 font-bold hover:bg-gray-50 transition-colors"
           >
             Previous
           </button>
           
           <button 
             @click="nextPart"
             class="px-8 py-2.5 rounded font-bold shadow-lg transition-all duration-200 flex items-center gap-2 transform hover:-translate-y-1"
             :class="isLastPart ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-navy hover:bg-blue-900 text-white'"
           >
             {{ isLastPart ? 'Finish Test' : 'Next Part' }}
             <svg v-if="!isLastPart" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>
           </button>
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