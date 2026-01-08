<script setup lang="ts">
import gsap from 'gsap'

onMounted(() => {
  // 1. Hero Content Entrance
  gsap.from('.hero-content', { 
    y: 50, 
    opacity: 0, 
    duration: 1, 
    ease: 'power3.out', 
    delay: 0.2 
  })

  // 2. Floating Background Icons Animation (The IELTS Pattern)
  // We use random values to make it look organic and "fluid"
  const icons = document.querySelectorAll('.floating-icon')
  icons.forEach((icon) => {
    gsap.to(icon, {
      y: "random(-20, 20)",
      x: "random(-10, 10)",
      rotation: "random(-15, 15)",
      duration: "random(3, 5)",
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: "random(0, 2)"
    })
  })

  // 3. Scroll Animations (Simple Observer)
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('opacity-100', 'translate-y-0')
        entry.target.classList.remove('opacity-0', 'translate-y-10')
      }
    })
  }, { threshold: 0.1 })

  document.querySelectorAll('.animate-on-scroll').forEach((el) => {
    observer.observe(el)
  })
})
</script>

<template>
  <div class="bg-offwhite overflow-x-hidden font-sans">
    
    <section class="relative bg-white pt-24 pb-32 overflow-hidden">
      
      <div class="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none z-0"></div>
      <div class="absolute bottom-0 left-0 -ml-20 -mb-20 w-[500px] h-[500px] bg-orange/10 rounded-full blur-3xl opacity-50 pointer-events-none z-0"></div>

      <div class="absolute inset-0 overflow-hidden pointer-events-none select-none z-0 opacity-10">
        <svg class="floating-icon absolute top-20 left-[10%] w-24 h-24 text-navy" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2a9 9 0 0 0-9 9v7a3 3 0 0 0 3 3h3v-8H4a7 7 0 0 1 7-7 7 7 0 0 1 7 7h-5v8h3a3 3 0 0 0 3-3v-7a9 9 0 0 0-9-9z"/></svg>
        <svg class="floating-icon absolute top-40 right-[15%] w-32 h-32 text-orange" fill="currentColor" viewBox="0 0 24 24"><path d="M14.06 9.02l.92.92L5.92 19H5v-.92l9.06-9.06M17.66 3c-.25 0-.51.1-.7.29l-1.83 1.83 3.75 3.75 1.83-1.83c.39-.39.39-1.04 0-1.41l-2.34-2.34c-.2-.2-.45-.29-.71-.29zm-3.6 3.19L3 17.25V21h3.75L17.81 9.94l-3.75-3.75z"/></svg>
        <svg class="floating-icon absolute bottom-32 left-[20%] w-20 h-20 text-mint" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4z"/></svg>
        <svg class="floating-icon absolute bottom-20 right-[25%] w-28 h-28 text-navy" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/><path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
      </div>

      <div class="container mx-auto px-4 relative z-10">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div class="hero-content text-left">
            <div class="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-blue-50 border border-blue-100 text-navy font-semibold text-sm">
              <span class="relative flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-orange"></span>
              </span>
              The #1 IELTS Platform for Bangladesh
            </div>
            
            <h1 class="text-5xl lg:text-7xl font-bold text-navy mb-6 tracking-tight leading-1.1">
              Achieve <br/> <span class="text-transparent bg-clip-text bg-gradient-to-r from-navy via-blue-600 to-mint">Band 7.5+</span> <br/>
              <span class="text-4xl lg:text-5xl font-normal text-slate-500">From Your Home</span>
            </h1>
            
            <p class="text-lg text-slate-600 mb-8 max-w-lg leading-relaxed">
              Experience the exact <strong>Computer-Delivered IELTS</strong> interface. 
              Get instant AI grading for Writing & Speaking and pay easily using bKash.
            </p>
            
            <div class="flex flex-col sm:flex-row gap-4">
              <NuxtLink to="/dashboard" class="bg-navy text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-navy-light transition shadow-lg hover:shadow-orange/20 transform hover:-translate-y-1 flex items-center justify-center gap-2">
                Start Free Mock
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
              </NuxtLink>
              <button class="px-8 py-4 rounded-xl font-bold text-navy border-2 border-gray-200 hover:border-navy hover:bg-blue-50 transition">
                Watch Demo
              </button>
            </div>

            <div class="mt-8 flex items-center gap-4 text-sm text-slate-500 font-medium">
              <span>Accepted Payments:</span>
              <div class="flex gap-2 grayscale opacity-70">
                <img src="https://freelogopng.com/images/all_img/1656234745bkash-app-logo-png.png" alt="bKash" class="h-6 object-contain">
                <img src="https://download.logo.wine/logo/Nagad/Nagad-Logo.wine.png" alt="Nagad" class="h-6 object-contain">
              </div>
            </div>
          </div>

          <div class="hero-content relative hidden lg:block">
            <div class="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white transform rotate-2 hover:rotate-0 transition duration-500">
              <img 
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2671&auto=format&fit=crop" 
                alt="Bangladeshi student studying" 
                class="w-full h-[500px] object-cover"
              />
              <div class="absolute inset-0 bg-gradient-to-t from-navy/80 to-transparent"></div>
              
              <div class="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl text-white flex justify-between items-center shadow-lg">
                <div>
                  <p class="text-xs text-slate-300 uppercase font-bold">Latest Result</p>
                  <p class="font-bold text-lg">Rahim Uddin</p>
                </div>
                <div class="text-right">
                  <span class="block text-3xl font-bold text-mint">8.0</span>
                  <span class="text-xs text-mint-dim font-bold">Overall Band</span>
                </div>
              </div>
            </div>

            <div class="absolute -z-10 -top-10 -right-10 w-32 h-32 bg-orange rounded-full opacity-20 animate-pulse"></div>
          </div>

        </div>
      </div>
    </section>

    <section class="py-24 bg-navy text-white relative overflow-hidden">
      <div class="absolute inset-0 opacity-5" style="background-image: radial-gradient(#ffffff 1px, transparent 1px); background-size: 30px 30px;"></div>

      <div class="container mx-auto px-4 relative z-10">
        <div class="grid md:grid-cols-2 gap-16 items-center">
          
          <div class="animate-on-scroll opacity-0 translate-y-10 transition duration-1000">
            <h2 class="text-3xl md:text-5xl font-bold mb-8 leading-tight">Old Coaching Centers <br/><span class="text-slate-400">vs.</span> <span class="text-mint">Technology</span></h2>
            
            <div class="space-y-8">
              <div class="flex gap-4 group">
                <div class="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-red-400 font-bold shrink-0 group-hover:bg-red-500/20 transition">✕</div>
                <div>
                  <h3 class="font-bold text-xl mb-1">Manual checking takes 5 days</h3>
                  <p class="text-slate-400 leading-relaxed">By the time you get your paper back, you've forgotten your thought process. It's inefficient.</p>
                </div>
              </div>

              <div class="flex gap-4 group">
                <div class="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-red-400 font-bold shrink-0 group-hover:bg-red-500/20 transition">✕</div>
                <div>
                  <h3 class="font-bold text-xl mb-1">Paper tests mislead you</h3>
                  <p class="text-slate-400 leading-relaxed">The real exam is on a computer. Handwriting doesn't matter; typing speed does.</p>
                </div>
              </div>
            </div>

            <div class="mt-12 p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-sm">
               <h3 class="font-bold text-mint mb-2 flex items-center gap-2">
                 <span class="w-2 h-2 bg-mint rounded-full animate-pulse"></span> The AI Advantage
               </h3>
               <p class="text-slate-300">"IELTS BD gave me my writing score in 45 seconds. I took 3 tests in one day." — <span class="text-white font-bold">Farhana, Dhaka</span></p>
            </div>
          </div>

          <div class="relative animate-on-scroll opacity-0 translate-y-10 transition duration-1000 delay-200">
            <div class="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
              <img 
                src="https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2670&auto=format&fit=crop" 
                alt="Digital Learning" 
                class="w-full object-cover opacity-80 hover:opacity-100 transition duration-700 hover:scale-105 transform"
              />
              <div class="absolute inset-0 bg-navy/30"></div>
              
              <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white text-navy p-6 rounded-xl shadow-2xl w-3/4">
                <div class="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                  <span class="font-bold text-sm">Writing Task 2 Report</span>
                  <span class="text-green-600 font-bold bg-green-100 px-2 py-1 rounded text-xs">Completed</span>
                </div>
                <div class="space-y-2">
                  <div class="h-2 bg-gray-200 rounded w-full"></div>
                  <div class="h-2 bg-gray-200 rounded w-5/6"></div>
                  <div class="h-2 bg-gray-200 rounded w-4/6"></div>
                </div>
                <div class="mt-4 flex gap-2">
                   <div class="flex-1 bg-mint/20 p-2 rounded text-center">
                     <span class="block text-xs text-slate-500">Grammar</span>
                     <span class="block font-bold text-mint text-lg">7.5</span>
                   </div>
                   <div class="flex-1 bg-orange/20 p-2 rounded text-center">
                     <span class="block text-xs text-slate-500">Vocab</span>
                     <span class="block font-bold text-orange text-lg">8.0</span>
                   </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>

    <section class="py-24 bg-offwhite">
      <div class="container mx-auto px-4">
        <div class="text-center max-w-3xl mx-auto mb-16">
          <span class="text-orange font-bold uppercase tracking-widest text-sm">Features</span>
          <h2 class="text-3xl md:text-4xl font-bold text-navy mt-2 mb-4">Everything to score Band 8.0</h2>
          <p class="text-slate-600">We don't just give you questions; we give you the data to analyze your mistakes.</p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition duration-300 animate-on-scroll opacity-0 translate-y-10 group">
            <div class="w-16 h-16 bg-orange rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange/30 group-hover:scale-110 transition">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </div>
            <h3 class="text-xl font-bold text-navy mb-3">AI Writing Assistant</h3>
            <p class="text-slate-500 leading-relaxed">Submit your essay and get a line-by-line breakdown of grammar, vocabulary, and cohesion errors instantly.</p>
          </div>

          <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition duration-300 animate-on-scroll opacity-0 translate-y-10 delay-100 group">
            <div class="w-16 h-16 bg-navy rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-navy/30 group-hover:scale-110 transition">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            </div>
            <h3 class="text-xl font-bold text-navy mb-3">Speaking Simulator</h3>
            <p class="text-slate-500 leading-relaxed">Record your answers to real Cue Card topics. Our AI analyzes fluency, pronunciation, and timing.</p>
          </div>

          <div class="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-2 transition duration-300 animate-on-scroll opacity-0 translate-y-10 delay-200 group">
            <div class="w-16 h-16 bg-mint rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-mint/30 group-hover:scale-110 transition">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            </div>
            <h3 class="text-xl font-bold text-navy mb-3">Performance Analytics</h3>
            <p class="text-slate-500 leading-relaxed">Don't guess your progress. See visual graphs of your improvement over time in all 4 modules.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="py-24 bg-white border-t border-gray-100">
      <div class="container mx-auto px-4">
        <div class="text-center mb-16">
          <h2 class="text-3xl font-bold text-navy">Simple, Affordable Pricing</h2>
          <p class="text-slate-500 mt-2">Invest in your future for less than the cost of a pizza.</p>
        </div>

        <div class="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div class="p-8 border border-gray-200 rounded-2xl hover:border-navy transition duration-300">
            <h3 class="text-lg font-bold text-slate-500 uppercase tracking-wide">Starter</h3>
            <div class="mt-4 mb-6">
              <span class="text-4xl font-bold text-navy">Free</span>
            </div>
            <ul class="space-y-4 mb-8 text-slate-600">
              <li class="flex items-center gap-2"><span class="text-green-500">✓</span> 1 Full Mock Test</li>
              <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Basic Scores</li>
              <li class="flex items-center gap-2 text-gray-400"><span class="text-gray-300">✕</span> No AI Writing Feedback</li>
            </ul>
            <button class="w-full py-3 border-2 border-navy text-navy font-bold rounded-lg hover:bg-navy hover:text-white transition">Sign Up Free</button>
          </div>

          <div class="p-8 bg-navy text-white rounded-2xl transform md:-translate-y-4 shadow-2xl shadow-navy/30 relative overflow-hidden">
            <div class="absolute top-0 right-0 bg-orange text-xs font-bold px-3 py-1 rounded-bl-lg">MOST POPULAR</div>
            <h3 class="text-lg font-bold text-slate-300 uppercase tracking-wide">Pro Bundle</h3>
            <div class="mt-4 mb-6">
              <span class="text-4xl font-bold text-white">৳ 499</span>
              <span class="text-sm text-slate-300"> / month</span>
            </div>
            <ul class="space-y-4 mb-8 text-slate-100">
              <li class="flex items-center gap-2"><span class="text-orange">✓</span> 10 Full Mock Tests</li>
              <li class="flex items-center gap-2"><span class="text-orange">✓</span> Detailed AI Writing Check</li>
              <li class="flex items-center gap-2"><span class="text-orange">✓</span> Speaking Recording Analysis</li>
              <li class="flex items-center gap-2"><span class="text-orange">✓</span> Performance Graphs</li>
            </ul>
            <button class="w-full py-3 bg-orange text-white font-bold rounded-lg hover:bg-orange-hover transition shadow-lg">Get Pro Access</button>
            <p class="text-xs text-center mt-4 text-slate-400 opacity-70">Accepts bKash, Nagad, Rocket</p>
          </div>

          <div class="p-8 border border-gray-200 rounded-2xl hover:border-navy transition duration-300">
            <h3 class="text-lg font-bold text-slate-500 uppercase tracking-wide">Unlimited</h3>
            <div class="mt-4 mb-6">
              <span class="text-4xl font-bold text-navy">৳ 999</span>
              <span class="text-sm text-slate-500"> / month</span>
            </div>
            <ul class="space-y-4 mb-8 text-slate-600">
              <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Unlimited Mock Tests</li>
              <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Priority AI Processing</li>
              <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Vocabulary Builder Tool</li>
            </ul>
            <button class="w-full py-3 border-2 border-navy text-navy font-bold rounded-lg hover:bg-navy hover:text-white transition">Choose Unlimited</button>
          </div>
        </div>
      </div>
    </section>

  </div>
</template>

<style scoped>
.bg-gradient-to-r {
  background-clip: text;
  -webkit-background-clip: text;
}
/* Ensure icons don't block clicks */
.floating-icon {
  pointer-events: none;
}
</style>