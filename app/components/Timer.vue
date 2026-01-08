<script setup lang="ts">
const props = defineProps<{ durationMinutes: number }>()
const timeLeft = ref(props.durationMinutes * 60)

const formattedTime = computed(() => {
  const m = Math.floor(timeLeft.value / 60).toString().padStart(2, '0')
  const s = (timeLeft.value % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

let timer: NodeJS.Timeout
onMounted(() => {
  timer = setInterval(() => {
    if (timeLeft.value > 0) timeLeft.value--
  }, 1000)
})
onUnmounted(() => clearInterval(timer))
</script>

<template>
  <span :class="timeLeft < 300 ? 'text-red-400 animate-pulse' : 'text-white'">
    {{ formattedTime }}
  </span>
</template>