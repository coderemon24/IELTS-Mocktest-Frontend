<template>
  <div class="min-h-screen flex flex-col">
    <nav class="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div class="container mx-auto px-4 h-16 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 bg-navy rounded text-white flex items-center justify-center font-bold">I</div>
          <span class="text-xl font-bold text-navy">IELTS<span class="text-orange">BD</span></span>
        </div>
        <div class="flex gap-4">
          <NuxtLink to="/" class="px-3 py-2 text-sm font-medium hover:text-navy">Home</NuxtLink>
          <NuxtLink to="/dashboard" class="px-3 py-2 text-sm font-medium hover:text-navy">Dashboard</NuxtLink>
        </div>
      </div>
    </nav>
    <main class="flex-grow">
      <slot />
    </main>
    <footer class="bg-navy text-white py-6 text-center text-sm opacity-90">
      &copy; 2024 IELTS BD. Built for Bangladeshi Students.
    </footer>
  </div>
</template>