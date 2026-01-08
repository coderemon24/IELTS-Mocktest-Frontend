<script setup lang="ts">
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register ScrollTrigger if you installed it, otherwise standard animations work fine
// Note: If you haven't installed ScrollTrigger, just use standard GSAP or remove the scroll logic.
// For this standalone example, we will use simple IntersectionObserver logic for fade-ins to keep it dependency-light, 
// or basic GSAP.

onMounted(() => {
  // Hero Animation
  gsap.from('.hero-content', { y: 50, opacity: 0, duration: 1, ease: 'power3.out', delay: 0.2 })
  
  // Staggered Animation for Feature Cards
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
  <div class="bg-offwhite overflow-x-hidden">
    
    <section class="relative bg-white pt-20 pb-32 overflow-hidden">
      <div class="absolute top-0 right-0 -mr-20 -mt-20 w-[600px] h-[600px] bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

      <div class="container mx-auto px-4 relative z-10 text-center">
        <div class="hero-content max-w-4xl mx-auto">
          <div class="inline-block px-4 py-1.5 mb-6 rounded-full bg-blue-50 border border-blue-100 text-navy font-semibold text-sm">
            🇧🇩 The #1 IELTS Platform for Bangladesh
          </div>
          <h1 class="text-5xl md:text-7xl font-bold text-navy mb-6 tracking-tight leading-tight">
            Achieve Band 7.0+ <br class="hidden md:block" />
            <span class="text-transparent bg-clip-text bg-gradient-to-r from-orange to-red-500">Without Leaving Home</span>
          </h1>
          <p class="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Experience the <strong>Computer-Delivered IELTS</strong> interface before the real exam. 
            Get instant AI grading for Writing & Speaking and pay easily using bKash.
          </p>
          
          <div class="flex flex-col sm:flex-row justify-center gap-4">
            <NuxtLink to="/dashboard" class="bg-navy text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-navy-light transition shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Start Free Mock Test
            </NuxtLink>
            <button class="px-8 py-4 rounded-xl font-bold text-navy border-2 border-gray-200 hover:border-navy hover:bg-blue-50 transition">
              View Sample Report
            </button>
          </div>

          <div class="mt-16 pt-8 border-t border-gray-100">
            <p class="text-sm text-gray-400 font-semibold mb-6 uppercase tracking-wider">Trusted by students targeting</p>
            <div class="flex flex-wrap justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <span class="font-bold text-xl flex items-center gap-2">🇨🇦 Canada</span>
              <span class="font-bold text-xl flex items-center gap-2">🇬🇧 UK</span>
              <span class="font-bold text-xl flex items-center gap-2">🇦🇺 Australia</span>
              <span class="font-bold text-xl flex items-center gap-2">🇺🇸 USA</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="py-24 bg-navy text-white">
      <div class="container mx-auto px-4">
        <div class="grid md:grid-cols-2 gap-16 items-center">
          <div class="animate-on-scroll opacity-0 translate-y-10 transition duration-1000">
            <h2 class="text-3xl md:text-4xl font-bold mb-6">Why traditional coaching isn't enough</h2>
            <div class="space-y-6">
              <div class="flex gap-4">
                <div class="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 font-bold shrink-0">✕</div>
                <div>
                  <h3 class="font-bold text-lg">Manual checking takes days</h3>
                  <p class="text-slate-300">Coaching centers take 3-5 days to return your writing copies. By then, you've forgotten your thought process.</p>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 font-bold shrink-0">✕</div>
                <div>
                  <h3 class="font-bold text-lg">Paper tests feel different</h3>
                  <p class="text-slate-300">The real exam is on a computer. Typing speed, split screens, and timers behave differently on paper.</p>
                </div>
              </div>
            </div>
          </div>

          <div class="bg-navy-dark p-8 rounded-2xl border border-white/10 animate-on-scroll opacity-0 translate-y-10 transition duration-1000 delay-200">
            <h2 class="text-3xl md:text-4xl font-bold mb-6 text-mint">The IELTS BD Advantage</h2>
            <div class="space-y-6">
              <div class="flex gap-4">
                <div class="w-12 h-12 rounded-full bg-mint/20 flex items-center justify-center text-mint font-bold shrink-0">✓</div>
                <div>
                  <h3 class="font-bold text-lg">Instant AI Results</h3>
                  <p class="text-slate-300">Get your Band Score for Writing & Speaking in <span class="text-white font-bold">30 seconds</span>, not 3 days.</p>
                </div>
              </div>
              <div class="flex gap-4">
                <div class="w-12 h-12 rounded-full bg-mint/20 flex items-center justify-center text-mint font-bold shrink-0">✓</div>
                <div>
                  <h3 class="font-bold text-lg">Exact Exam Simulation</h3>
                  <p class="text-slate-300">Our UI is a 1:1 replica of the IDP/British Council interface. No surprises on exam day.</p>
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
          <h2 class="text-3xl font-bold text-navy mb-4">Everything you need to score 8.0</h2>
          <p class="text-slate-600">We don't just give you questions; we give you the tools to analyze your mistakes.</p>
        </div>

        <div class="grid md:grid-cols-3 gap-8">
          <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition animate-on-scroll opacity-0 translate-y-10 duration-700">
            <div class="w-14 h-14 bg-orange/10 rounded-xl flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </div>
            <h3 class="text-xl font-bold text-navy mb-3">AI Writing Assistant</h3>
            <p class="text-slate-500 leading-relaxed">Submit your essay and get a line-by-line breakdown of grammar, vocabulary, and cohesion errors.</p>
          </div>

          <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition animate-on-scroll opacity-0 translate-y-10 duration-700 delay-100">
            <div class="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-navy" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
            </div>
            <h3 class="text-xl font-bold text-navy mb-3">Speaking Simulator</h3>
            <p class="text-slate-500 leading-relaxed">Record your answers to real Cue Card topics. Our AI analyzes fluency, pronunciation, and timing.</p>
          </div>

          <div class="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition animate-on-scroll opacity-0 translate-y-10 duration-700 delay-200">
            <div class="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
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
              <li class="flex items-center gap-2"><span class="text-green-500">✓</span> Basic Reading/Listening Scores</li>
              <li class="flex items-center gap-2 text-gray-400"><span class="text-gray-300">✕</span> No AI Writing Feedback</li>
            </ul>
            <button class="w-full py-3 border-2 border-navy text-navy font-bold rounded-lg hover:bg-navy hover:text-white transition">Sign Up Free</button>
          </div>

          <div class="p-8 bg-navy text-white rounded-2xl transform md:-translate-y-4 shadow-xl relative overflow-hidden">
            <div class="absolute top-0 right-0 bg-orange text-xs font-bold px-3 py-1 rounded-bl-lg">POPULAR</div>
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
            <button class="w-full py-3 bg-orange text-white font-bold rounded-lg hover:bg-orange-hover transition">Get Pro Access</button>
            <p class="text-xs text-center mt-4 text-slate-400">Accepts bKash, Nagad, Rocket</p>
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

    <footer class="bg-navy-dark text-white pt-16 pb-8 border-t border-white/10">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          
          <div class="col-span-1 md:col-span-1">
            <div class="flex items-center gap-2 mb-6">
              <div class="w-8 h-8 bg-orange rounded text-white flex items-center justify-center font-bold">I</div>
              <span class="text-xl font-bold text-white">IELTS<span class="text-orange">BD</span></span>
            </div>
            <p class="text-slate-400 text-sm leading-relaxed mb-6">
              Empowering Bangladeshi students to achieve their study abroad dreams through accessible, high-quality technology.
            </p>
            <div class="text-sm text-slate-400">
              <p>📍 Banani, Dhaka-1213</p>
              <p>📧 support@ieltsbd.com</p>
              <p>📞 +880 1700-000000</p>
            </div>
          </div>

          <div>
            <h4 class="font-bold text-lg mb-6">Platform</h4>
            <ul class="space-y-3 text-slate-400 text-sm">
              <li><a href="#" class="hover:text-orange transition">Take a Mock Test</a></li>
              <li><a href="#" class="hover:text-orange transition">Pricing & Plans</a></li>
              <li><a href="#" class="hover:text-orange transition">Band Score Calculator</a></li>
              <li><a href="#" class="hover:text-orange transition">Student Success Stories</a></li>
            </ul>
          </div>

          <div>
            <h4 class="font-bold text-lg mb-6">Resources</h4>
            <ul class="space-y-3 text-slate-400 text-sm">
              <li><a href="#" class="hover:text-orange transition">IELTS Reading Tips</a></li>
              <li><a href="#" class="hover:text-orange transition">Writing Task 1 Guide</a></li>
              <li><a href="#" class="hover:text-orange transition">Speaking Cue Cards 2024</a></li>
              <li><a href="#" class="hover:text-orange transition">Vocabulary List</a></li>
            </ul>
          </div>

          <div>
            <h4 class="font-bold text-lg mb-6">Stay Updated</h4>
            <p class="text-slate-400 text-sm mb-4">Get the latest exam predictions and tips.</p>
            <form class="flex gap-2">
              <input type="email" placeholder="Email address" class="bg-white/10 border border-white/20 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-orange w-full" />
              <button class="bg-orange px-4 py-2 rounded text-sm font-bold hover:bg-orange-hover transition">Join</button>
            </form>
          </div>
        </div>

        <div class="border-t border-white/10 pt-8 flex flex-col items-center">
          <div class="flex gap-6 mb-6">
            <a href="#" class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-600 transition text-white">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"></path></svg>
            </a>
            <a href="#" class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-pink-600 transition text-white">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="#" class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-600 transition text-white">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"></path></svg>
            </a>
            <a href="#" class="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-400 transition text-white">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg>
            </a>
          </div>
          
          <div class="text-slate-500 text-xs text-center">
            &copy; 2024 IELTS BD Ltd. All rights reserved. | <a href="#" class="hover:text-white">Privacy Policy</a> | <a href="#" class="hover:text-white">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>

  </div>
</template>

<style scoped>
/* Optional: Only if you want to enhance the gradients or specific shapes */
.bg-gradient-to-r {
  background-clip: text;
  -webkit-background-clip: text;
}
</style>