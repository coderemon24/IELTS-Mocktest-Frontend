<script setup lang="ts">
definePageMeta({ layout: 'exam' })

const currentQ = ref(1)
const answers = reactive({ q1: '', q2: '' })

// Dummy Reading Passage
const passage = `
  <h2 class="text-xl font-bold mb-4">The Rivers of Bangladesh</h2>
  <p class="mb-4">Bangladesh is a riverine country. The network of rivers that criss-crosses the country...</p>
  <p class="mb-4">The Padma, Meghna, and Jamuna are the major arteries of transport and commerce...</p>
`
</script>

<template>
  <NuxtLayout name="exam">
    <template #timer>
      <Timer :duration-minutes="60" />
    </template>

    <div class="h-full flex flex-col md:flex-row divide-x divide-gray-200">
      <div class="w-full md:w-1/2 h-full overflow-y-auto bg-white p-8 custom-scroll">
        <div class="max-w-prose mx-auto font-serif text-lg text-gray-800" v-html="passage"></div>
      </div>

      <div class="w-full md:w-1/2 h-full overflow-y-auto bg-gray-50 p-8 custom-scroll">
        <div class="max-w-lg mx-auto">
          <div class="mb-8 p-5 bg-white rounded border border-gray-200 shadow-sm">
            <label class="block font-bold mb-3 text-navy">1. Which rivers are mentioned?</label>
            <input v-model="answers.q1" type="text" class="w-full border-2 border-gray-300 rounded p-2 focus:border-navy outline-none" placeholder="Answer..." />
          </div>
          
          <div class="mb-8 p-5 bg-white rounded border border-gray-200 shadow-sm">
             <label class="block font-bold mb-3 text-navy">2. Is it a riverine country?</label>
             <div class="flex gap-4">
               <label class="flex items-center gap-2"><input type="radio" value="YES" v-model="answers.q2"> YES</label>
               <label class="flex items-center gap-2"><input type="radio" value="NO" v-model="answers.q2"> NO</label>
             </div>
          </div>
        </div>
      </div>
    </div>

    <div class="absolute bottom-0 w-full h-16 bg-gray-100 border-t flex items-center justify-between px-6">
      <div class="flex gap-2">
        <button class="w-10 h-10 rounded bg-navy text-white font-bold">1</button>
        <button class="w-10 h-10 rounded bg-gray-300 hover:bg-gray-400 font-bold text-gray-700">2</button>
      </div>
      <button class="font-bold text-navy">Next Section &rarr;</button>
    </div>
  </NuxtLayout>
</template>