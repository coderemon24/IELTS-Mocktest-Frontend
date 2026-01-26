// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  
  modules: [
    '@nuxtjs/tailwindcss',
  ],

  tailwindcss: {
    config: {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            navy: {
              DEFAULT: '#0F172A',
              light: '#1E293B',
              dark: '#020617',
            },
            mint: {
              DEFAULT: '#2DD4BF',
              dim: '#99F6E4',
            },
            orange: {
              DEFAULT: '#F97316',
              hover: '#EA580C',
            },
            offwhite: '#F8FAFC',
          }
        }
      }
    }
  },
  
  app: {
    head: {
      title: 'IELTS BD - Master Your Future',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'IELTS BD - Master Your Future' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },
})