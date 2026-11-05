/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
      },
      colors: {
        ink: {
          950: '#070708',
          900: '#0b0b0d',
          850: '#0f0f12',
          800: '#131316',
          750: '#18181c',
          700: '#1e1e23',
          600: '#2a2a31',
          500: '#3a3a43',
        },
        gold: {
          100: '#f8ecc9',
          200: '#f0dca4',
          300: '#e7c983',
          400: '#d9b36a',
          500: '#c8a059',
          600: '#a97f3f',
          700: '#7d5c2b',
        },
        ivory: {
          50: '#fdfaf3',
          100: '#f8f1e3',
          200: '#efe3cb',
          300: '#e2d2b3',
          400: '#cbb995',
        },
      },
      boxShadow: {
        premium:
          '0 24px 80px -24px rgba(0,0,0,0.9), 0 2px 0 rgba(255,255,255,0.04) inset',
        gold: '0 0 0 1px rgba(217,179,106,0.45), 0 18px 50px -18px rgba(217,179,106,0.35)',
      },
      backgroundImage: {
        'radial-fade':
          'radial-gradient(ellipse at top, rgba(217,179,106,0.12), transparent 60%)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translate3d(0,0,0) rotate(0deg)' },
          '50%': { transform: 'translate3d(0,-18px,0) rotate(2deg)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '200% 50%' },
          '100%': { backgroundPosition: '-200% 50%' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '0.35' },
          '50%': { opacity: '0.8' },
        },
        spinSlow: {
          to: { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'float-slow': 'float-slow 9s ease-in-out infinite',
        shimmer: 'shimmer 8s linear infinite',
        'pulse-soft': 'pulseSoft 4s ease-in-out infinite',
        'spin-slow': 'spinSlow 18s linear infinite',
      },
    },
  },
  plugins: [],
};
