<template>
  <nav class="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 transition-all duration-300">
      <div class="container mx-auto px-4 h-20 flex items-center justify-between">
        
        <NuxtLink to="/" class="flex items-center gap-2 group">
          <div class="w-10 h-10 bg-navy rounded-xl text-white flex items-center justify-center font-bold text-xl group-hover:rotate-12 transition transform">I</div>
          <span class="text-2xl font-bold text-navy tracking-tight">IELTS<span class="text-orange">BD</span></span>
        </NuxtLink>

        <div class="hidden md:flex items-center gap-8">
          <NuxtLink to="/" class="text-sm font-semibold text-slate-600 hover:text-navy transition relative group">
            Home
            <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange transition-all group-hover:w-full"></span>
          </NuxtLink>
          <NuxtLink to="/dashboard" class="text-sm font-semibold text-slate-600 hover:text-navy transition relative group">
            Mock Tests
            <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange transition-all group-hover:w-full"></span>
          </NuxtLink>
          <NuxtLink to="/dashboard" class="text-sm font-semibold text-slate-600 hover:text-navy transition relative group">
            Dashboard
            <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-orange transition-all group-hover:w-full"></span>
          </NuxtLink>
        </div>

        <div class="flex items-center gap-4">
          
          <div v-if="isLoggedIn" class="flex items-center gap-3">
             <NuxtLink to="/dashboard/profile" class="flex items-center gap-3 pl-2 pr-1 py-1 rounded-full border border-gray-200 hover:border-navy hover:shadow-md transition bg-white group cursor-pointer">
               <div class="text-right hidden sm:block">
                 <p class="text-xs font-bold text-navy">Rahim U.</p>
                 <p class="text-[10px] text-slate-400">Student</p>
               </div>
               <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop" class="w-9 h-9 rounded-full border-2 border-white shadow-sm group-hover:scale-105 transition" alt="Profile">
             </NuxtLink>
          </div>

          <NuxtLink v-else to="/auth/login" class="group relative px-6 py-2.5 rounded-xl bg-navy text-white font-bold overflow-hidden shadow-lg shadow-navy/20 hover:shadow-navy/40 transition-all transform hover:-translate-y-0.5">
            <span class="relative z-10 flex items-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
              Login
            </span>
            <div class="absolute inset-0 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></div>
          </NuxtLink>

        </div>
      </div>
    </nav>
</template>