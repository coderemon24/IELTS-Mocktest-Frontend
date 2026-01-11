<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useExamSystem } from '~/composables/useExamSystem'

const { saveStatus, highlights, userAnswers } = useExamSystem()

// State
const showContextMenu = ref(false)
const contextMenuPosition = ref({ x: 0, y: 0 })
const selectedText = ref('')
const selectedRange = ref<Range | null>(null)

// Highlight Removal State
const targetHighlightId = ref<number | null>(null) // To track which highlight needs removal

// Note Modal State
const showNoteModal = ref(false)
const currentNoteText = ref('')
const currentNoteId = ref<number | null>(null)
const isViewingNote = ref(false)
const showNotesSidebar = ref(false)

// --- 1. HANDLE SELECTION & CLICKS ---
const handleMouseUp = () => {
  const selection = window.getSelection()
  
  // A. If clicking inside Context Menu, do nothing (let button click happen)
  if (showContextMenu.value) {
     // We rely on click handlers of buttons to close menu
     return
  }

  // B. Check if user selected new text
  if (selection && selection.toString().length > 0) {
    const range = selection.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    
    selectedText.value = selection.toString()
    selectedRange.value = range
    targetHighlightId.value = null // We are creating new, not removing old
    
    contextMenuPosition.value = {
      x: rect.left + (rect.width / 2),
      y: rect.top - 10
    }
    showContextMenu.value = true
  } 
  else {
    // C. Clicked outside (hide menu with slight delay to prevent flicker)
    setTimeout(() => {
        // Only hide if we didn't just click a highlight (handled in applyHighlight onClick)
        if (!targetHighlightId.value) {
            showContextMenu.value = false
        }
    }, 200)
  }
}

// --- 2. APPLY HIGHLIGHT (UPDATED) ---
const applyHighlight = (color: string) => {
  if (!selectedRange.value) return

  try {
     const id = Date.now()
     const span = document.createElement('span')
     span.id = `highlight-${id}` // Important for removal
     span.style.backgroundColor = color
     span.className = 'cursor-pointer hover:opacity-80 transition-opacity rounded px-0.5 highlight-span'
     span.title = 'Click to remove highlight'
     
     // D. Click Event for Existing Highlight
     span.onclick = (e) => {
         e.stopPropagation() // Prevent selecting text underneath
         
         const rect = span.getBoundingClientRect()
         targetHighlightId.value = id // Set target ID for removal
         
         contextMenuPosition.value = {
             x: rect.left + (rect.width / 2),
             y: rect.top - 10
         }
         showContextMenu.value = true
         window.getSelection()?.removeAllRanges() // Clear native selection
     }

     selectedRange.value.surroundContents(span)
     
     highlights.value.push({
       id: id,
       text: selectedText.value,
       color: color,
       type: 'highlight',
       timestamp: Date.now()
     })

     window.getSelection()?.removeAllRanges()
     showContextMenu.value = false
  } catch (e) {
    console.warn('Selection crosses block boundaries')
  }
}

// --- 3. REMOVE HIGHLIGHT FUNCTION (NEW) ---
const removeHighlight = () => {
    if (!targetHighlightId.value) return

    // Remove from DOM
    const span = document.getElementById(`highlight-${targetHighlightId.value}`)
    if (span) {
        const text = span.textContent
        const textNode = document.createTextNode(text || '')
        span.parentNode?.replaceChild(textNode, span)
    }

    // Remove from State
    highlights.value = highlights.value.filter(h => h.id !== targetHighlightId.value)

    // Reset UI
    targetHighlightId.value = null
    showContextMenu.value = false
}

// --- 4. NOTE LOGIC (UNCHANGED MOSTLY) ---
const openNoteInput = () => {
  currentNoteText.value = ''
  currentNoteId.value = null
  isViewingNote.value = false
  showNoteModal.value = true
  showContextMenu.value = false
}

const saveNote = () => {
  if (!selectedRange.value && !isViewingNote.value) return
  
  if (!isViewingNote.value) {
    try {
        const noteId = Date.now()
        const span = document.createElement('span')
        span.id = `note-${noteId}` 
        span.className = 'border-b-2 border-dashed border-blue-500 text-blue-700 bg-blue-50 cursor-pointer hover:bg-blue-100 transition-colors'
        span.onclick = (e) => {
            e.stopPropagation() 
            viewNote(noteId, currentNoteText.value) // Fixed logic here to get note content from array in real app
        }
        selectedRange.value?.surroundContents(span)
        highlights.value.push({ id: noteId, text: selectedText.value, note: currentNoteText.value, type: 'note', timestamp: Date.now() })
    } catch(e) {}
  }
  showNoteModal.value = false
  window.getSelection()?.removeAllRanges()
}

const viewNote = (id: number, note: string) => {
    // Ideally find note from array to get latest text
    const found = highlights.value.find(h => h.id === id)
    if(found) {
        currentNoteText.value = found.note
        currentNoteId.value = id
        isViewingNote.value = true 
        showNoteModal.value = true
    }
}

const deleteNote = (id: number) => {
    highlights.value = highlights.value.filter(h => h.id !== id)
    const spanElement = document.getElementById(`note-${id}`)
    if (spanElement) {
        const text = spanElement.textContent
        const textNode = document.createTextNode(text || '')
        spanElement.parentNode?.replaceChild(textNode, spanElement)
    }
    showNoteModal.value = false
    currentNoteId.value = null
}

onMounted(() => {
  document.addEventListener('mouseup', handleMouseUp)
})
onUnmounted(() => {
  document.removeEventListener('mouseup', handleMouseUp)
})
</script>

<template>
  <div class="h-screen flex flex-col bg-white overflow-hidden select-text relative">
    
    <header class="h-16 bg-slate-900 text-white flex items-center justify-between px-6 shrink-0 shadow-md z-40 relative">
      <div class="flex items-center gap-6">
        <div class="text-sm hidden md:block">
            <span class="opacity-70">Candidate:</span> <span class="font-bold ml-1">Rahim Uddin</span>
        </div>
        <div class="flex items-center gap-2 text-xs font-mono px-3 py-1 rounded bg-white/10 border border-white/5">
           <span class="relative flex h-2 w-2">
             <span v-if="saveStatus === 'saving'" class="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
             <span class="relative inline-flex rounded-full h-2 w-2" :class="{'bg-green-400': saveStatus === 'saved', 'bg-yellow-400': saveStatus === 'saving', 'bg-red-500': saveStatus === 'error'}"></span>
           </span>
           <span class="uppercase tracking-wider opacity-80">{{ saveStatus === 'saved' ? 'Saved' : 'Saving...' }}</span>
        </div>
      </div>
      <div class="bg-slate-800 px-4 py-1 rounded text-xl font-mono tracking-widest font-bold border border-slate-700">
        <slot name="timer" /> 
      </div>
      <div class="flex items-center gap-3">
          <button @click="showNotesSidebar = !showNotesSidebar" class="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded text-xs font-bold transition border border-slate-600">
            Notes ({{ highlights.filter(h => h.type === 'note').length }})
          </button>
          <NuxtLink to="/" class="bg-red-600 hover:bg-red-700 px-4 py-1.5 rounded text-xs font-bold transition shadow-lg">EXIT</NuxtLink>
      </div>
    </header>

    <main class="flex-1 overflow-hidden relative flex">
      <div class="flex-1 h-full overflow-hidden relative">
          <slot />
          
          <div 
            v-if="showContextMenu"
            :style="{ top: `${contextMenuPosition.y}px`, left: `${contextMenuPosition.x}px` }"
            class="fixed z-[100] transform -translate-x-1/2 -translate-y-full mb-2 flex flex-col items-center animate-fade-in"
            @mousedown.stop 
          >
            <div v-if="!targetHighlightId" class="bg-slate-800 text-white rounded-lg shadow-xl border border-slate-700 p-1.5 flex items-center gap-1">
              <button @click.stop="applyHighlight('#fef08a')" class="w-8 h-8 rounded hover:bg-white/10 flex items-center justify-center" title="Yellow">
                <div class="w-4 h-4 bg-yellow-200 rounded-full border border-yellow-400"></div>
              </button>
              <button @click.stop="applyHighlight('#bbf7d0')" class="w-8 h-8 rounded hover:bg-white/10 flex items-center justify-center" title="Green">
                <div class="w-4 h-4 bg-green-200 rounded-full border border-green-400"></div>
              </button>
              <div class="w-px h-5 bg-white/20 mx-1"></div>
              <button @click.stop="openNoteInput" class="px-3 h-8 rounded hover:bg-white/10 flex items-center gap-2 text-xs font-bold text-sky-400">
                Note
              </button>
            </div>

            <div v-else class="bg-red-600 text-white rounded-lg shadow-xl border border-red-500 p-1.5 flex items-center gap-1">
                <button @click.stop="removeHighlight" class="px-3 h-8 rounded hover:bg-white/20 flex items-center gap-2 text-xs font-bold">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    Remove Highlight
                </button>
            </div>

            <div class="w-3 h-3 rotate-45 transform -translate-y-1.5 border-b border-r" 
                 :class="targetHighlightId ? 'bg-red-600 border-red-500' : 'bg-slate-800 border-slate-700'">
            </div>
          </div>
      </div>

      <transition name="slide-fade">
        <div v-if="showNotesSidebar" class="w-80 bg-slate-50 border-l border-slate-200 h-full shadow-2xl flex flex-col z-30 absolute right-0 top-0 md:relative">
            <div class="p-4 bg-white border-b border-slate-200 flex justify-between items-center shadow-sm">
                <h3 class="font-bold text-slate-700">My Notes</h3>
                <button @click="showNotesSidebar = false" class="text-slate-400 hover:text-slate-600">✕</button>
            </div>
            <div class="flex-1 overflow-y-auto p-4 custom-scroll">
                <div v-for="item in highlights.filter(h => h.type === 'note')" :key="item.id" class="mb-4 bg-white p-3 rounded-lg border border-slate-200 shadow-sm relative group">
                    <button @click="deleteNote(item.id)" class="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-colors">🗑</button>
                    <p class="text-xs text-slate-400 font-mono mb-1 border-l-2 border-sky-400 pl-2 line-clamp-1 italic">"{{ item.text }}"</p>
                    <p class="text-sm text-slate-700 font-medium">{{ item.note }}</p>
                </div>
            </div>
        </div>
      </transition>
    </main>

    <Teleport to="body">
      <div v-if="showNoteModal" class="fixed inset-0 z-[200] flex items-center justify-center px-4">
        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="showNoteModal = false"></div>
        <div class="bg-white w-full max-w-sm rounded-xl shadow-2xl p-6 relative z-10">
          <div class="flex justify-between items-center mb-2">
              <h3 class="font-bold text-slate-700">{{ isViewingNote ? 'View Note' : 'Add Note' }}</h3>
              <button v-if="isViewingNote && currentNoteId" @click="deleteNote(currentNoteId)" class="text-red-400 bg-red-50 px-2 py-1 rounded text-xs font-bold">Delete</button>
          </div>
          <textarea v-model="currentNoteText" rows="4" :readonly="isViewingNote" class="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-sky-500 outline-none" placeholder="Type note..."></textarea>
          <div class="flex justify-end gap-2 mt-4">
            <button @click="showNoteModal = false" class="px-4 py-2 text-slate-500 text-sm font-bold hover:bg-slate-50 rounded-lg">Close</button>
            <button v-if="!isViewingNote" @click="saveNote" class="px-4 py-2 bg-sky-600 text-white text-sm font-bold rounded-lg hover:bg-sky-700">Save</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>