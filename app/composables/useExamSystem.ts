import { ref, watch, onMounted } from 'vue'
import { debounce } from 'lodash-es' // npm install lodash-es needed or write custom debounce

const userAnswers = ref<Record<string, any>>({})
const highlights = ref<any[]>([])
const saveStatus = ref<'saved' | 'saving' | 'error'>('saved')

export const useExamSystem = () => {
  
  // 1. Initialize & Recover Data
  const initExam = (examId: string) => {
    onMounted(() => {
      // Load from LocalStorage (Crash Recovery)
      const localData = localStorage.getItem(`exam_${examId}_answers`)
      if (localData) {
        try {
          userAnswers.value = JSON.parse(localData)
        } catch (e) { console.error('Error parsing local data', e) }
      }

      const localHighlights = localStorage.getItem(`exam_${examId}_highlights`)
      if (localHighlights) {
         highlights.value = JSON.parse(localHighlights)
      }
    })
  }

  // 2. Auto-Save Logic (Local + Server)
  const saveToBackend = debounce(async () => {
    saveStatus.value = 'saving'
    try {
      // Simulate API Call
      await new Promise(resolve => setTimeout(resolve, 800))
      // await $fetch('/api/save-exam', { method: 'POST', body: { answers: userAnswers.value, highlights: highlights.value } })
      
      saveStatus.value = 'saved'
    } catch (error) {
      saveStatus.value = 'error'
    }
  }, 2000)

  // Watch for changes
  watch([userAnswers, highlights], ([newAnswers, newHighlights]) => {
    saveStatus.value = 'saving'
    
    // Immediate Local Save
    localStorage.setItem('exam_current_answers', JSON.stringify(newAnswers))
    localStorage.setItem('exam_current_highlights', JSON.stringify(newHighlights))
    
    // Background Server Sync
    saveToBackend()
  }, { deep: true })

  return {
    userAnswers,
    highlights,
    saveStatus,
    initExam
  }
}