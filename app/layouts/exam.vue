<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useExamSystem } from '~/composables/useExamSystem' // Ensure you created this file

// Access Global State
const { saveStatus, highlights, userAnswers } = useExamSystem()

// --- Text Selection & Context Menu Logic ---
const showContextMenu = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const selectedText = ref('')
const selectedRange = ref<Range | null>(null)
const showNoteModal = ref(false)
const currentNote = ref('')

// Handle Text Selection
const handleSelection = () => {
  const selection = window.getSelection()
  
  if (selection && selection.toString().length > 0) {
    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    
    selectedText.value = selection.toString()
    selectedRange.value = range
    
    // Position menu just above the selection
    contextMenuPosition.value = {
      x: rect.left + (rect.width / 2),
      y: rect.top - 10
    }
    showContextMenu.value = true
  } else {
    // Hide menu if clicked elsewhere without selection
    showContextMenu.value = false
  }
}

// Action: Highlight Text
const applyHighlight = (color: string) => {
  if (!selectedRange.value) return

  // Visual Implementation (DOM)
  // Note: Complex highlighting requires ensuring we don't break HTML tags.
  // This is a simplified version using document.execCommand for demonstration
  // ideally use a library like 'CSS.highlights' or custom span wrapping
  
  try {
     // Create a highlight span
     const span = document.createElement('span')
     span.style.backgroundColor = color
     span.className = 'cursor-pointer hover:opacity-80 transition-opacity'
     span.title = 'Right click to remove'
     
     selectedRange.value.surroundContents(span)
     
     // Save to State
     highlights.value.push({
       text: selectedText.value,
       color: color,
       timestamp: Date.now()
     })

     // Clear Selection
     window.getSelection()?.removeAllRanges()
     showContextMenu.value = false
  } catch (e) {
    console.warn('Cannot highlight across block elements in this simple implementation')
  }
}

// Action: Add Note
const openNoteInput = () => {
  currentNote.value = ''
  showNoteModal.value = true
  showContextMenu.value = false
}

const saveNote = () => {
  if (!selectedRange.value) return
  
  // Save note logic here (linked to the text position)
  highlights.value.push({
      text: selectedText.value,
      note: currentNote.value,
      type: 'note',
      timestamp: Date.now()
  })
  
  showNoteModal.value = false
  window.getSelection()?.removeAllRanges()
}

// Handle Mouse Events for Selection
onMounted(() => {
  document.addEventListener('mouseup', handleSelection)
  // Optional: Prevent default right click if you want custom context menu only
  document.addEventListener('contextmenu', (e) => e.preventDefault()) 
})

onUnmounted(() => {
  document.removeEventListener('mouseup', handleSelection)
})
</script>

<template>
  <div class="h-screen flex flex-col bg-white overflow-hidden select-text">
    
    <header class="h-16 bg-slate-900 text-white flex items-center justify-between px-6 shrink-0 shadow-md z-50">
      <div class="flex items-center gap-6">
        <div class="text-sm">
          <span class="opacity-70">Candidate:</span> <span class="font-bold ml-1">Rahim Uddin</span>
        </div>
        
        <div class="flex items-center gap-2 text-xs font-mono px-3 py-1 rounded bg-white/10 border border-white/5">
           <span class="relative flex h-2 w-2">
             <span v-if="saveStatus === 'saving'" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
             <span class="relative inline-flex rounded-full h-2 w-2" 
               :class="{
                 'bg-green-400': saveStatus === 'saved',
                 'bg-yellow-400': saveStatus === 'saving',
                 'bg-red-500': saveStatus === 'error'
               }"></span>
           </span>
           <span class="uppercase tracking-wider opacity-80">
             {{ saveStatus === 'saved' ? 'All Saved' : saveStatus === 'saving' ? 'Saving...' : 'Offline' }}
           </span>
        </div>
      </div>

      <div class="bg-slate-800 px-4 py-1 rounded text-xl font-mono tracking-widest font-bold border border-slate-700">
        <slot name="timer" /> 
      </div>
      
      <NuxtLink to="/" class="bg-red-500 hover:bg-red-600 px-4 py-1 rounded text-xs font-bold transition shadow-lg shadow-red-500/20">
        EXIT TEST
      </NuxtLink>
    </header>

    <main class="flex-1 overflow-hidden relative">
      <slot />

      <div 
        v-if="showContextMenu"
        :style="{ top: `${contextMenuPosition.y}px`, left: `${contextMenuPosition.x}px` }"
        class="fixed z-[100] transform -translate-x-1/2 -translate-y-full mb-2 flex flex-col items-center animate-fade-in"
      >
        <div class="bg-slate-800 text-white rounded-lg shadow-xl border border-slate-700 p-1.5 flex items-center gap-1">
          <button @click.stop="applyHighlight('#fef08a')" class="w-8 h-8 rounded hover:bg-white/10 flex items-center justify-center group" title="Highlight Yellow">
             <div class="w-4 h-4 bg-yellow-200 rounded-full border border-yellow-400"></div>
          </button>
          <button @click.stop="applyHighlight('#bbf7d0')" class="w-8 h-8 rounded hover:bg-white/10 flex items-center justify-center group" title="Highlight Green">
             <div class="w-4 h-4 bg-green-200 rounded-full border border-green-400"></div>
          </button>
          
          <div class="w-px h-5 bg-white/20 mx-1"></div>
          
          <button @click.stop="openNoteInput" class="px-3 h-8 rounded hover:bg-white/10 flex items-center gap-2 text-xs font-bold">
            <svg class="w-4 h-4 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            Note
          </button>
        </div>
        <div class="w-3 h-3 bg-slate-800 rotate-45 transform -translate-y-1.5 border-b border-r border-slate-700"></div>
      </div>
    </main>

    <Teleport to="body">
      <div v-if="showNoteModal" class="fixed inset-0 z-[200] flex items-center justify-center px-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showNoteModal = false"></div>
        <div class="bg-white w-full max-w-sm rounded-xl shadow-2xl p-6 relative z-10 animate-scale-in">
          <h3 class="font-bold text-slate-700 mb-2">Add Note</h3>
          <p class="text-xs text-slate-500 mb-4 italic border-l-2 border-teal-500 pl-2 line-clamp-2">"{{ selectedText }}"</p>
          <textarea 
            v-model="currentNote"
            rows="4" 
            class="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-teal-500 outline-none resize-none"
            placeholder="Type your note here..."
            autofocus
          ></textarea>
          <div class="flex justify-end gap-2 mt-4">
            <button @click="showNoteModal = false" class="px-4 py-2 text-slate-500 text-sm font-bold hover:bg-slate-50 rounded-lg">Cancel</button>
            <button @click="saveNote" class="px-4 py-2 bg-teal-600 text-white text-sm font-bold rounded-lg hover:bg-teal-700">Save Note</button>
          </div>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.15s ease-out;
}
.animate-scale-in {
  animation: scaleIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes fadeIn {
  from { opacity: 0; transform: translate(-50%, -90%); }
  to { opacity: 1; transform: translate(-50%, -100%); }
}
@keyframes scaleIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}
</style>