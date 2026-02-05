<script setup lang="ts">
const route = useRoute()
const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/'
await navigateTo(`/auth/login?redirect=${encodeURIComponent(redirect)}`)
</script>

<template>
  <div class="min-h-[calc(100vh-80px)] flex items-center justify-center">
    <p class="text-slate-500 text-sm">Redirecting...</p>
  </div>
</template>
