<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, reactive } from 'vue'
import { gsap } from 'gsap'
import { useRouter } from 'vue-router'

definePageMeta({ layout: false })

const router = useRouter()
const currentStep = ref(0)
const isPlaying = ref(false)
const audioProgress = ref(0)
const audioDuration = ref(180) 
const audioCurrentTime = ref(0)
const leftPane = ref<HTMLElement | null>(null)
const rightPane = ref<HTMLElement | null>(null)

// Store User Answers
const userAnswers = reactive<Record<string, any>>({})

// Modal State
const showSubmitModal = ref(false)

let audioInterval: any = null
let visualizerInterval: any = null
const visualizerBars = ref<number[]>(new Array(40).fill(5)) 

// --- Mock Data (Updated: 10 Questions per part, Fill in blank style) ---
const listeningParts = [
  {
    id: 1,
    title: 'Part 1: Travel Arrangements',
    instruction: 'Complete the notes below using NO MORE THAN TWO WORDS AND/OR A NUMBER.',
    type: 'fill-blank',
    questions: [
      { id: 'q1', text: 'The customer wants to book a flight to __________.', before: true },
      { id: 'q2', text: 'The preferred departure date is __________.', before: true },
      { id: 'q3', text: 'He would like to request a __________ meal on the flight.', before: true },
      { id: 'q4', text: 'The maximum baggage allowance is __________ kg per person.', before: true },
      { id: 'q5', text: 'The hotel must be close to the __________ center.', before: true },
      { id: 'q6', text: 'He plans to rent a __________ for three days.', before: true },
      { id: 'q7', text: 'The total cost of the package is $__________.', before: true },
      { id: 'q8', text: 'A deposit of __________% is required immediately.', before: true },
      { id: 'q9', text: 'The customer\'s phone number is __________.', before: true },
      { id: 'q10', text: 'He heard about the agency through a __________.', before: true }
    ],
    duration: '05:00'
  },
  {
    id: 2,
    title: 'Part 2: Museum Tour',
    instruction: 'Listen to the guide. Complete the sentences below.',
    type: 'fill-blank',
    questions: [
      { id: 'q11', text: 'The museum was originally built in the year __________.', before: true },
      { id: 'q12', text: 'Visitors are not allowed to take __________ inside the main hall.', before: true },
      { id: 'q13', text: 'The most famous exhibit is the __________ from the 18th century.', before: true },
      { id: 'q14', text: 'The guided tour usually lasts for __________ minutes.', before: true },
      { id: 'q15', text: 'You can buy souvenirs in the shop located on the __________ floor.', before: true },
      { id: 'q16', text: 'The museum is closed on __________ for maintenance.', before: true },
      { id: 'q17', text: 'Tickets for students cost $__________.', before: true },
      { id: 'q18', text: 'The special exhibition focuses on __________ history.', before: true },
      { id: 'q19', text: 'Group bookings require at least __________ days notice.', before: true },
      { id: 'q20', text: 'Please leave your __________ in the locker room.', before: true }
    ],
    duration: '05:30'
  },
  {
    id: 3,
    title: 'Part 3: Biology Lecture',
    instruction: 'Complete the summary using NO MORE THAN ONE WORD.',
    type: 'fill-blank',
    questions: [
      { id: 'q21', text: 'The professor is discussing the behavior of __________ in the wild.', before: true },
      { id: 'q22', text: 'These animals are primarily active during the __________.', before: true },
      { id: 'q23', text: 'Their main source of food is __________ found in the river.', before: true },
      { id: 'q24', text: 'Climate change has reduced their population by __________%.', before: true },
      { id: 'q25', text: 'Researchers use __________ to track their movements.', before: true },
      { id: 'q26', text: 'The animals communicate using a specific type of __________.', before: true },
      { id: 'q27', text: 'Breeding usually occurs in the month of __________.', before: true },
      { id: 'q28', text: 'The young stay with their mothers for __________ years.', before: true },
      { id: 'q29', text: 'The biggest threat to their habitat is __________.', before: true },
      { id: 'q30', text: 'Conservation efforts are currently funded by the __________.', before: true }
    ],
    duration: '06:00'
  }
]

const currentPartData = computed(() => listeningParts[currentStep.value])
const isLastPart = computed(() => currentStep.value === listeningParts.length - 1)

// --- Submit & Stats Logic ---

const totalQuestions = computed(() => {
  return listeningParts.reduce((acc, part) => acc + part.questions.length, 0)
})

const answeredCount = computed(() => {
  return Object.values(userAnswers).filter(val => val !== '' && val !== null && val !== undefined).length
})

const missingCount = computed(() => {
  return totalQuestions.value - answeredCount.value
})

const handleNextOrSubmit = () => {
  if (isLastPart.value) {
    pauseAudio()
    showSubmitModal.value = true
  } else {
    nextPart()
  }
}

const confirmSubmit = () => {
  // Logic for API submission goes here
  console.log('Final Answers:', userAnswers)
  showSubmitModal.value = false
  router.push('/') 
}

// --- Helper: Format Time ---
const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0')
  const s = Math.floor(seconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

// --- Audio Logic ---
const toggleAudio = () => {
  if (isPlaying.value) pauseAudio()
  else playAudio()
}

const playAudio = () => {
  isPlaying.value = true
  audioInterval = setInterval(() => {
    if (audioCurrentTime.value < audioDuration.value) {
      audioCurrentTime.value++
      audioProgress.value = (audioCurrentTime.value / audioDuration.value) * 100
    } else {
      pauseAudio()
      audioCurrentTime.value = 0
      audioProgress.value = 0
    }
  }, 1000)

  visualizerInterval = setInterval(() => {
    visualizerBars.value = visualizerBars.value.map(() => Math.max(10, Math.random() * 90))
  }, 100)
}

const pauseAudio = () => {
  isPlaying.value = false
  clearInterval(audioInterval)
  clearInterval(visualizerInterval)
  visualizerBars.value = visualizerBars.value.map(() => 5)
}

const seekAudio = (e: any) => {
  const percent = e.target.value
  audioCurrentTime.value = Math.floor((percent / 100) * audioDuration.value)
  audioProgress.value = percent
}

// --- Navigation ---
const nextPart = () => {
  pauseAudio()
  audioCurrentTime.value = 0
  audioProgress.value = 0
  
  if (leftPane.value && rightPane.value) {
      gsap.to([leftPane.value, rightPane.value], { 
        opacity: 0, 
        y: -10, 
        duration: 0.3, 
        ease: 'power2.in',
        onComplete: () => {
          if (currentStep.value < listeningParts.length - 1) {
            currentStep.value++
            nextTick(() => {
                gsap.fromTo([leftPane.value, rightPane.value], 
                  { y: 20, opacity: 0 },
                  { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power3.out' }
                )
            })
          }
        }
      })
  }
}

const prevPart = () => {
  if (currentStep.value > 0) {
    pauseAudio()
    audioCurrentTime.value = 0
    audioProgress.value = 0
    currentStep.value--
    nextTick(() => {
        gsap.fromTo([leftPane.value, rightPane.value], 
            { y: -20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'power3.out' }
        )
    })
  }
}

// --- Lifecycle ---
onMounted(() => {
  if (leftPane.value && rightPane.value) {
    gsap.from([leftPane.value, rightPane.value], { 
      y: 30, opacity: 0, duration: 0.8, stagger: 0.2, ease: 'power3.out' 
    })
  }
})

onUnmounted(() => {
  pauseAudio()
})
</script>

<template>
  <NuxtLayout name="exam">
    <template #timer>
      <Timer :duration-minutes="30" />
    </template>

    <div class="flex flex-col h-screen w-full overflow-hidden bg-slate-50 relative">
      
      <div class="flex-grow flex flex-col md:flex-row h-full overflow-hidden pb-24">
        
        <div ref="leftPane" class="w-full md:w-7/12 h-full overflow-y-auto bg-white custom-scroll border-r border-slate-200">
          <div class="max-w-3xl mx-auto p-8 md:p-12">
            
            <div class="mb-8">
              <div class="flex items-center gap-3 mb-4">
                <span class="px-2.5 py-0.5 bg-teal-100 text-teal-700 text-[10px] font-bold uppercase tracking-widest rounded">
                  {{ currentPartData.duration }}
                </span>
                <span class="text-xs font-bold text-slate-400 uppercase tracking-widest">Listening Section</span>
              </div>
              
              <h1 class="text-3xl md:text-4xl font-bold text-slate-800 mb-6">{{ currentPartData.title }}</h1>
              
              <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
                <p class="text-slate-700 font-medium italic">
                  <span class="font-bold not-italic text-blue-700 block text-xs uppercase tracking-wide mb-1">Instruction:</span>
                  {{ currentPartData.instruction }}
                </p>
              </div>
            </div>

            <div v-if="currentPartData.type === 'fill-blank'" class="animate-fade-in">
               <div class="bg-gradient-to-b from-teal-50/50 to-white p-6 md:p-8 rounded-2xl border border-teal-100 shadow-sm">
                 <ul class="space-y-6">
                   <li v-for="(q, idx) in currentPartData.questions" :key="q.id" class="flex gap-4 text-lg text-slate-700 leading-relaxed items-baseline">
                     
                     <span class="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-white border border-teal-200 text-teal-700 font-bold rounded-full text-sm shadow-sm select-none">
                       {{ (currentStep * 10) + idx + 1 }}
                     </span>

                     <div class="font-serif w-full">
                        <span v-if="q.text.includes('__________')">
                            {{ q.text.split('__________')[0] }}
                            <span class="inline-block relative group mx-1 align-baseline">
                            <input 
                                type="text" 
                                v-model="userAnswers[q.id]"
                                class="w-40 px-2 py-0.5 bg-transparent border-b-2 border-slate-400 text-center font-bold text-teal-700 focus:border-teal-600 focus:bg-teal-50 outline-none transition-all placeholder:font-normal placeholder:text-slate-300 text-lg"
                                placeholder="answer"
                            />
                            </span>
                            {{ q.text.split('__________')[1] }}
                        </span>
                        
                        <span v-else>
                            {{ q.text }}
                             <input 
                                type="text" 
                                v-model="userAnswers[q.id]"
                                class="w-40 px-2 py-0.5 bg-transparent border-b-2 border-slate-400 text-center font-bold text-teal-700 focus:border-teal-600 focus:bg-teal-50 outline-none transition-all placeholder:font-normal placeholder:text-slate-300 text-lg"
                            />
                        </span>
                     </div>
                   </li>
                 </ul>
               </div>
            </div>

            <div class="h-20"></div>
          </div>
        </div>

        <div ref="rightPane" class="w-full md:w-5/12 h-full bg-slate-900 relative flex flex-col items-center justify-center overflow-hidden">
          
          <div class="absolute inset-0 bg-slate-900">
            <div class="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-teal-900/40 rounded-full blur-[100px]"></div>
            <div class="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-900/30 rounded-full blur-[80px]"></div>
          </div>

          <div class="relative z-10 w-full max-w-sm px-6">
            
            <div class="flex justify-center mb-8">
                <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 border border-white/10 backdrop-blur-md">
                    <span class="relative flex h-2 w-2">
                      <span v-if="isPlaying" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                      <span class="relative inline-flex rounded-full h-2 w-2" :class="isPlaying ? 'bg-teal-500' : 'bg-red-500'"></span>
                    </span>
                    <span class="text-[10px] font-bold tracking-[0.2em] text-slate-300 uppercase">
                        {{ isPlaying ? 'Playing Audio' : 'Audio Paused' }}
                    </span>
                </div>
            </div>

            <div class="text-center mb-10">
              <h3 class="text-white text-2xl font-medium tracking-tight">{{ currentPartData.title }}</h3>
              <p class="text-slate-400 text-sm mt-1">Listening Test • Section {{ currentStep + 1 }}</p>
            </div>

            <div class="h-20 flex items-end justify-center gap-[3px] mb-8 w-full">
               <div 
                 v-for="(h, i) in visualizerBars" 
                 :key="i"
                 class="w-1.5 rounded-t-full transition-all duration-100 ease-linear"
                 :class="isPlaying ? 'bg-gradient-to-t from-teal-500 to-teal-200' : 'bg-slate-700'"
                 :style="{ 
                   height: isPlaying ? h + '%' : '4px',
                   opacity: isPlaying ? 0.8 : 0.3
                 }"
               ></div>
            </div>

            <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
              <div class="w-full mb-6 group">
                <input 
                  type="range" 
                  min="0" 
                  :max="100" 
                  :value="audioProgress"
                  @input="seekAudio"
                  class="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-teal-500 hover:accent-teal-400"
                />
                <div class="flex justify-between text-[11px] font-medium text-slate-400 mt-2 font-mono">
                  <span>{{ formatTime(audioCurrentTime) }}</span>
                  <span>{{ formatTime(audioDuration) }}</span>
                </div>
              </div>

              <div class="flex items-center justify-center gap-8">
                <button class="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
                   <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.333 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" /></svg>
                </button>

                <button 
                  @click="toggleAudio"
                  class="w-16 h-16 rounded-full flex items-center justify-center shadow-[0_0_25px_rgba(20,184,166,0.3)] hover:shadow-[0_0_35px_rgba(20,184,166,0.5)] transition-all duration-300 transform hover:scale-105 active:scale-95 bg-teal-500 text-white"
                >
                  <svg v-if="isPlaying" class="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                  </svg>
                  <svg v-else class="w-6 h-6 fill-current ml-1" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z"/>
                  </svg>
                </button>

                <button class="text-slate-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
                   <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" /></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-slate-200 z-50 flex items-center justify-between px-6 md:px-12 shadow-[0_-5px_20px_rgba(0,0,0,0.02)]">
        
        <div class="flex items-center gap-1 md:gap-3">
            <template v-for="(part, idx) in listeningParts" :key="part.id">
                <div class="flex flex-col items-center">
                    <div 
                        class="min-w-[36px] h-9 px-3 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all duration-300"
                        :class="[
                            currentStep === idx ? 'bg-teal-600 border-teal-600 text-white scale-105 shadow-lg' : 
                            currentStep > idx ? 'bg-teal-50 border-teal-200 text-teal-600' : 
                            'bg-white border-slate-200 text-slate-300'
                        ]"
                    >
                        <span v-if="currentStep > idx">✓</span>
                        <span v-else>{{ (idx * 10) + 1 }}-{{ (idx + 1) * 10 }}</span>
                    </div>
                </div>
                <div v-if="idx < listeningParts.length - 1" 
                     class="w-6 md:w-12 h-0.5 rounded-full transition-colors duration-300"
                     :class="currentStep > idx ? 'bg-teal-200' : 'bg-slate-100'">
                </div>
            </template>
        </div>

        <div class="flex gap-4">
            <button 
                v-if="currentStep > 0"
                @click="prevPart"
                class="px-5 py-2.5 rounded-lg border-2 border-slate-200 text-slate-600 font-bold hover:border-slate-300 hover:bg-slate-50 transition-colors text-sm"
            >
                Back
            </button>
            
            <button 
                @click="handleNextOrSubmit" 
                class="px-8 py-2.5 rounded-lg font-bold shadow-lg shadow-teal-500/30 transition-all duration-200 flex items-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0 text-sm text-white"
                :class="isLastPart ? 'bg-slate-800 hover:bg-slate-900' : 'bg-teal-600 hover:bg-teal-700'"
            >
                {{ isLastPart ? 'Submit Exam' : 'Next Section' }}
                <svg v-if="!isLastPart" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                </svg>
            </button>
        </div>
      </div>

    </div>

    <Teleport to="body">
      <Transition 
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div v-if="showSubmitModal" class="fixed inset-0 z-[100] flex items-center justify-center px-4">
          
          <div @click="showSubmitModal = false" class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"></div>

          <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all scale-100">
            
            <div class="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 class="font-bold text-slate-700">Confirm Submission</h3>
              <button @click="showSubmitModal = false" class="text-slate-400 hover:text-slate-600 transition-colors">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>

            <div class="p-6 md:p-8 text-center">
              <div class="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg class="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              
              <h2 class="text-xl font-bold text-slate-800 mb-2">Ready to finish?</h2>
              <p class="text-slate-500 text-sm mb-6">You are about to submit your exam. Please check your progress summary below.</p>

              <div class="grid grid-cols-2 gap-4 mb-2">
                <div class="p-3 bg-teal-50 border border-teal-100 rounded-xl">
                  <span class="block text-2xl font-bold text-teal-700">{{ answeredCount }}</span>
                  <span class="text-[10px] font-bold text-teal-600/60 uppercase tracking-wider">Answered</span>
                </div>
                <div class="p-3 bg-red-50 border border-red-100 rounded-xl">
                  <span class="block text-2xl font-bold text-red-500">{{ missingCount }}</span>
                  <span class="text-[10px] font-bold text-red-400/60 uppercase tracking-wider">Missing</span>
                </div>
              </div>
            </div>

            <div class="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button 
                @click="showSubmitModal = false"
                class="flex-1 py-2.5 px-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-100 hover:text-slate-800 transition-colors text-sm"
              >
                Review Answers
              </button>
              <button 
                @click="confirmSubmit"
                class="flex-1 py-2.5 px-4 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 shadow-lg shadow-teal-500/20 transition-all text-sm"
              >
                Submit Exam
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </NuxtLayout>
</template>

<style scoped>
/* Custom Scrollbar */
.custom-scroll::-webkit-scrollbar {
  width: 6px;
}
.custom-scroll::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
.custom-scroll::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Animations */
.animate-fade-in {
  animation: fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(15px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Range Input Reset */
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
}
input[type=range]::-moz-range-thumb {
  border: none;
}
</style>