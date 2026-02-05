<script setup lang="ts">
import { computed } from 'vue'
import Editor from '@tinymce/tinymce-vue'
import 'tinymce/tinymce'
import 'tinymce/icons/default'
import 'tinymce/themes/silver'
import 'tinymce/models/dom'
import 'tinymce/plugins/advlist'
import 'tinymce/plugins/anchor'
import 'tinymce/plugins/autolink'
import 'tinymce/plugins/charmap'
import 'tinymce/plugins/code'
import 'tinymce/plugins/codesample'
import 'tinymce/plugins/directionality'
import 'tinymce/plugins/emoticons'
import 'tinymce/plugins/fullscreen'
import 'tinymce/plugins/help'
import 'tinymce/plugins/image'
import 'tinymce/plugins/insertdatetime'
import 'tinymce/plugins/link'
import 'tinymce/plugins/lists'
import 'tinymce/plugins/media'
import 'tinymce/plugins/nonbreaking'
import 'tinymce/plugins/pagebreak'
import 'tinymce/plugins/preview'
import 'tinymce/plugins/quickbars'
import 'tinymce/plugins/searchreplace'
import 'tinymce/plugins/table'
import 'tinymce/plugins/template'
import 'tinymce/plugins/visualchars'
import 'tinymce/plugins/visualblocks'
import 'tinymce/plugins/wordcount'

const props = defineProps<{
  modelValue: string | null
  placeholder?: string
  height?: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | null): void
}>()

const value = computed({
  get: () => props.modelValue ?? '',
  set: (val: string) => emit('update:modelValue', val || null),
})

const editorInit = computed(() => ({
  height: props.height ?? 180,
  menubar: 'file edit view insert format tools table help',
  statusbar: true,
  branding: false,
  promotion: false,
  plugins: [
    'advlist',
    'autolink',
    'lists',
    'link',
    'image',
    'charmap',
    'codesample',
    'directionality',
    'emoticons',
    'preview',
    'anchor',
    'searchreplace',
    'visualchars',
    'visualblocks',
    'code',
    'fullscreen',
    'insertdatetime',
    'media',
    'nonbreaking',
    'pagebreak',
    'quickbars',
    'table',
    'template',
    'help',
    'wordcount',
  ],
  toolbar:
    'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | ' +
    'alignleft aligncenter alignright alignjustify | outdent indent | numlist bullist | ' +
    'forecolor backcolor removeformat | ltr rtl | link image media table | ' +
    'charmap emoticons pagebreak nonbreaking | insertdatetime codesample | ' +
    'preview visualblocks visualchars code fullscreen',
  placeholder: props.placeholder ?? 'Write instructions...',
  content_style:
    'body { font-family: Inter, Arial, sans-serif; font-size: 14px; }',
}))
</script>

<template>
  <ClientOnly>
    <Editor v-model="value" :init="editorInit" />
  </ClientOnly>
</template>
