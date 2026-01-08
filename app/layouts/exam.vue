<template>
  <div class="h-screen flex flex-col bg-white overflow-hidden select-none">
    <header class="h-16 bg-navy text-white flex items-center justify-between px-6 shrink-0 shadow-md z-50">
      <div class="text-sm">
        <span class="opacity-70">Candidate:</span> <span class="font-bold ml-1">Rahim Uddin</span>
      </div>
      <div class="bg-navy-dark px-4 py-1 rounded text-xl font-mono tracking-widest font-bold">
        <slot name="timer" /> </div>
      <button class="bg-red-500 hover:bg-red-600 px-4 py-1 rounded text-xs font-bold transition">
        EXIT TEST
      </button>
    </header>
    <main class="flex-1 overflow-hidden relative">
      <slot />
    </main>
  </div>
</template>