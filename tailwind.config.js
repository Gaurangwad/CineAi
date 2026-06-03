/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['DM Serif Display', 'serif'],
        sans: ['DM Sans', 'sans-serif'],
      },
      colors: {
        deep: '#0a0a0f',
        surface: '#111118',
        surface2: '#1a1a24',
        surface3: '#22222e',
        gold: '#C9A84C',
        'gold-dim': '#8a6f2e',
        'text-primary': '#e8e4d9',
        'text-dim': '#9a9080',
        'text-muted': '#5a5448',
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-up': 'slideUp 0.3s ease',
        'fade-in': 'fadeIn 0.4s ease',
      },
      keyframes: {
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
