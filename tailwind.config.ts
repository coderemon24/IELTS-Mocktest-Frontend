// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default <Config>{
  content: [
    "./app/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#1B365D',
          light: '#2C4A75',
          dark: '#0F2341'
        },
        mint: {
          DEFAULT: '#2ECC71',
          dim: '#27AE60'
        },
        orange: {
          DEFAULT: '#F39C12',
          hover: '#E67E22'
        },
        offwhite: '#F8F9FA'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
      }
    }
  }
}