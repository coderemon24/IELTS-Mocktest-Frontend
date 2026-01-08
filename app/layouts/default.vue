<script setup lang="ts">
// Mock state for demonstration. 
// In a real app, use useSupabaseUser() or a pinia store.
const isLoggedIn = ref(false) 
</script>

<template>
  <div class="min-h-screen flex flex-col font-sans bg-offwhite">
    
    <Navbar />

    <main class="flex-grow">
      <slot />
    </main>

    <Footer />
    
  </div>
</template>