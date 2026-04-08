const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
        cyan: {
          400: '#22d3ee',
        },
        sky: {
          400: '#38bdf8',
        },
        orange: {
          400: '#fb923c',
        },
        background: '#050505',
        surface: '#0d0d0d',
        primary: {
          DEFAULT: '#10b981', // Matrix Emerald
          hover: '#059669',
        },
        secondary: {
          DEFAULT: '#06b6d4', // Cyber Cyan
          hover: '#0891b2',
        },
        accent: '#8b5cf6', // Neural Violet
        'glass-white': 'rgba(255, 255, 255, 0.02)',
        'glass-border': 'rgba(255, 255, 255, 0.05)',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 15px rgba(16, 185, 129, 0.2)',
        'glow-secondary': '0 0 15px rgba(6, 182, 212, 0.2)',
        'terminal': '0 0 30px rgba(0, 0, 0, 0.5)',
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: 1, transform: 'scale(1)' },
          '50%': { opacity: 0.8, transform: 'scale(1.05)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'pulse-slow': 'pulse-slow 8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 2s infinite',
      },
    },
  },
  plugins: [],
}