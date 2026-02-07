<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

type SummernoteJQuery = {
  summernote: (arg1?: any, arg2?: any) => any
}

const props = defineProps<{
  modelValue: string | null
  placeholder?: string
  height?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
}>()

const editorRef = ref<HTMLElement | null>(null)
let $editor: SummernoteJQuery | null = null
let syncingFromModel = false

const JQUERY_SRC = 'https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js'
const SUMMERNOTE_CSS =
  'https://cdn.jsdelivr.net/npm/summernote@0.9.0/dist/summernote-lite.min.css'
const SUMMERNOTE_JS =
  'https://cdn.jsdelivr.net/npm/summernote@0.9.0/dist/summernote-lite.min.js'

const loadScript = (src: string) =>
  new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`) as
      | HTMLScriptElement
      | null
    if (existing?.dataset.loaded === 'true') {
      resolve()
      return
    }
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true })
      existing.addEventListener('error', () => reject(new Error(`Failed: ${src}`)), {
        once: true,
      })
      return
    }

    const el = document.createElement('script')
    el.src = src
    el.async = true
    el.addEventListener(
      'load',
      () => {
        el.dataset.loaded = 'true'
        resolve()
      },
      { once: true },
    )
    el.addEventListener('error', () => reject(new Error(`Failed: ${src}`)), {
      once: true,
    })
    document.head.appendChild(el)
  })

const loadCss = (href: string) => {
  const existing = document.querySelector(`link[href="${href}"]`)
  if (existing) return
  const el = document.createElement('link')
  el.rel = 'stylesheet'
  el.href = href
  document.head.appendChild(el)
}

const htmlToValue = (html: string) => {
  const temp = document.createElement('div')
  temp.innerHTML = html
  const text = (temp.textContent ?? '').replace(/\u00a0/g, ' ').trim()
  return text ? html : null
}

const initEditor = () => {
  if (!editorRef.value) return
  const w = window as any
  const $ = w.jQuery || w.$
  if (!$) return

  $editor = $(editorRef.value) as SummernoteJQuery
  $editor.summernote({
    height: props.height ?? 180,
    placeholder: props.placeholder ?? 'Write instructions...',
    toolbar: [
      ['style', ['bold', 'italic', 'underline', 'clear']],
      ['para', ['ul', 'ol', 'paragraph']],
      ['insert', ['link']],
      ['view', ['codeview']],
    ],
    callbacks: {
      onChange: (contents: string) => {
        if (syncingFromModel) return
        emit('update:modelValue', htmlToValue(contents))
      },
    },
  })

  syncingFromModel = true
  $editor.summernote('code', props.modelValue ?? '')
  syncingFromModel = false
}

watch(
  () => props.modelValue,
  (val) => {
    if (!$editor) return
    const next = val ?? ''
    const current = ($editor.summernote('code') ?? '') as string
    if (current === next) return
    syncingFromModel = true
    $editor.summernote('code', next)
    syncingFromModel = false
  },
)

onMounted(async () => {
  if (!process.client) return
  loadCss(SUMMERNOTE_CSS)
  await loadScript(JQUERY_SRC)
  await loadScript(SUMMERNOTE_JS)
  initEditor()
})

onBeforeUnmount(() => {
  if ($editor) {
    $editor.summernote('destroy')
    $editor = null
  }
})
</script>

<template>
  <ClientOnly>
    <div ref="editorRef"></div>
  </ClientOnly>
</template>

<style>
.note-editor .note-editable ul {
  list-style: disc;
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.note-editor .note-editable ol {
  list-style: decimal;
  margin: 0.5rem 0;
  padding-left: 1.5rem;
}

.note-editor .note-editable li {
  display: list-item;
}
</style>
