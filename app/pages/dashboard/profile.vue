<script setup lang="ts">
import gsap from 'gsap'

onMounted(() => {
  gsap.from('.form-section', { y: 20, opacity: 0, duration: 0.6, ease: 'power2.out' })
})

const user = ref({
  name: 'Rahim Uddin',
  email: 'rahim.u@example.com',
  role: 'student',
  institute: 'North South University',
  bio: 'Aiming for a Masters in Computer Science in Canada. Need Band 7.5 overall with no band less than 6.5.',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000&auto=format&fit=crop'
})

const handleSave = () => {
  // Logic to save profile
  alert('Profile updated successfully!')
}
</script>

<template>
  <div class="min-h-screen bg-offwhite p-6 md:p-8">
    <div class="max-w-4xl mx-auto">
      
      <h2 class="text-2xl font-bold text-navy mb-6">Profile Settings</h2>

      <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden form-section">
        
        <div class="h-32 bg-gradient-to-r from-navy to-blue-600 relative"></div>

        <div class="px-8 pb-8">
          <div class="relative -mt-16 mb-8 flex items-end">
            <div class="relative w-32 h-32">
              <img :src="user.avatar" alt="Avatar" class="w-32 h-32 rounded-full border-4 border-white object-cover shadow-md" />
              <button class="absolute bottom-1 right-1 bg-orange text-white p-2 rounded-full hover:bg-orange-hover transition shadow-lg" title="Change Photo">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
              </button>
            </div>
            <div class="ml-4 mb-2">
              <h3 class="text-xl font-bold text-navy">{{ user.name }}</h3>
              <p class="text-sm text-slate-500">Member since 2024</p>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div>
              <label class="block text-sm font-bold text-slate-700 mb-2">Full Name</label>
              <input v-model="user.name" type="text" class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-navy focus:ring-1 focus:ring-navy outline-none transition" />
            </div>

            <div>
              <label class="block text-sm font-bold text-slate-700 mb-2">Email Address</label>
              <input v-model="user.email" type="email" disabled class="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 text-slate-500 cursor-not-allowed" />
            </div>

            <div>
              <label class="block text-sm font-bold text-slate-700 mb-2">Current Status</label>
              <select v-model="user.role" class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-navy focus:ring-1 focus:ring-navy outline-none transition bg-white">
                <option value="student">Student</option>
                <option value="job_holder">Job Holder</option>
                <option value="unemployed">Looking for Work</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-bold text-slate-700 mb-2">Institute / Company Name</label>
              <input v-model="user.institute" type="text" class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-navy focus:ring-1 focus:ring-navy outline-none transition" />
            </div>

            <div class="md:col-span-2">
              <label class="block text-sm font-bold text-slate-700 mb-2">Study Goals / Bio</label>
              <textarea v-model="user.bio" rows="4" class="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-navy focus:ring-1 focus:ring-navy outline-none transition resize-none"></textarea>
              <p class="text-xs text-slate-400 mt-1">Briefly describe why you are taking the IELTS.</p>
            </div>

          </div>

          <div class="mt-8 flex justify-end">
            <button @click="handleSave" class="bg-navy text-white px-8 py-3 rounded-lg font-bold hover:bg-navy-light transition shadow-lg hover:shadow-xl">
              Save Changes
            </button>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>