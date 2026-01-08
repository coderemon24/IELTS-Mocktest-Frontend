<script setup lang="ts">
import gsap from "gsap";

onMounted(() => {
  // Simple, professional fade-in
  gsap.from(".login-container", {
    y: 20,
    opacity: 0,
    duration: 0.6,
    ease: "power2.out",
  });
});

const showPassword = ref(false);
const rememberMe = ref(false);
</script>

<template>
  <div
    class="flex min-h-screen py-12 px-4 bg-slate-50 items-center justify-center relative sm:px-6 lg:px-8"
  >
    <div class="overflow-hidden pointer-events-none absolute inset-0">
      <div
        class="w-[40rem] h-[40rem] bg-blue-100/40 rounded-full absolute -top-[10%] -right-[5%] blur-3xl"
      ></div>
      <div
        class="w-[40rem] h-[40rem] bg-orange/5 rounded-full absolute -bottom-[10%] -left-[5%] blur-3xl"
      ></div>
    </div>

    <div
      class="z-10 w-[50rem] space-y-8 p-5 py-8 bg-white rounded-2xl border border-gray-100 shadow-xl login-container !xl:w-[40rem] relative"
    >
      <div class="text-center">
        <NuxtLink to="/" class="inline-flex mb-6 items-center gap-2 group">
          <div
            class="flex w-10 h-10 text-white font-bold text-xl bg-navy rounded-lg items-center justify-center"
          >
            I
          </div>
          <span class="text-2xl font-bold text-navy tracking-tight"
            >IELTS<span class="text-orange">BD</span></span
          >
        </NuxtLink>
        <h2 class="text-2xl font-bold text-gray-900">
          Sign in to your account
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          Welcome back! Please enter your details.
        </p>
      </div>

      <form action="/dashboard/profile" class="mt-8 space-y-6">
        <div class="space-y-5">
          <div>
            <label
              for="email"
              class="block mb-1 text-sm font-semibold text-gray-700"
              >Email address</label
            >
            <div class="relative">
              <div
                style="padding-left: 0.5rem; padding-top: 1.3rem"
                class="flex pl-3 pointer-events-none absolute inset-y-0 left-4 items-center"
              >
                <svg
                  class="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                  ></path>
                </svg>
              </div>
              <input
                id="email"
                name="email"
                type="email"
                required
                style="padding-left: 1.7rem"
                class="block w-full p-4 placeholder-gray-400 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-navy focus:border-navy transition ease-in-out duration-150 sm:text-sm"
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div>
            <label
              for="password"
              class="block mb-1 text-sm font-semibold text-gray-700"
              >Password</label
            >
            <div class="relative">
              <div
                style="padding-left: 0.5rem; padding-top: 1.3rem"
                class="flex pointer-events-none absolute inset-y-0 left-0 items-center"
              >
                <svg
                  class="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  ></path>
                </svg>
              </div>
              <input
                id="password"
                name="password"
                :type="showPassword ? 'text' : 'password'"
                required
                style="padding-left: 1.7rem"
                class="block w-full p-4 placeholder-gray-400 border border-gray-300 rounded-lg appearance-none focus:outline-none focus:ring-navy focus:border-navy transition ease-in-out duration-150 sm:text-sm"
                placeholder="••••••••"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                style="top: 1.3rem; right: 0.5rem"
                class="flex pr-3 text-gray-400 cursor-pointer absolute inset-y-0 top-0 right-0 items-center hover:text-navy"
              >
                <svg
                  v-if="!showPassword"
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  ></path>
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  ></path>
                </svg>
                <svg
                  v-else
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              v-model="rememberMe"
              class="h-4 w-4 text-navy border-gray-300 cursor-pointer focus:ring-navy rounded"
            />
            <label
              for="remember-me"
              class="block ml-2 text-sm text-gray-900 cursor-pointer"
            >
              Remember me
            </label>
          </div>

          <div class="text-sm">
            <a href="#" class="font-medium text-orange hover:text-orange-hover">
              Forgot your password?
            </a>
          </div>
        </div>

        <div>
          <button
            type="submit"
            class="flex w-full py-2.5 px-4 text-sm font-bold text-white bg-navy border border-transparent rounded-lg transition-all shadow-md group relative justify-center hover:bg-navy-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-navy duration-200 hover:shadow-lg"
          >
            Sign in
          </button>
        </div>
      </form>

      <div class="mt-6">
        <div class="relative">
          <div class="flex absolute inset-0 items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="flex text-sm relative justify-center">
            <span class="px-2 text-gray-500 bg-white">Or continue with</span>
          </div>
        </div>

        <div class="grid grid-cols-2 mt-6 gap-3">
          <button
            type="button"
            class="inline-flex w-full py-2.5 px-4 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg shadow-sm justify-center hover:bg-gray-50 transition"
          >
            <img
              class="h-5 w-5"
              src="https://www.svgrepo.com/show/475656/google-color.svg"
              alt="Google"
            />
            <span class="ml-2">Google</span>
          </button>

          <button
            type="button"
            class="inline-flex w-full py-2.5 px-4 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg shadow-sm justify-center hover:bg-gray-50 transition"
          >
            <img
              class="h-5 w-5"
              src="https://www.svgrepo.com/show/475647/facebook-color.svg"
              alt="Facebook"
            />
            <span class="ml-2">Facebook</span>
          </button>
        </div>
      </div>

      <div class="mt-6 text-center">
        <p class="text-sm text-gray-600">
          Don't have an account?
          <NuxtLink
            to="/auth/register"
            class="font-bold text-navy hover:text-orange transition"
          >
            Create an account
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>
