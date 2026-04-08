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
        background: '#020202',
        surface: '#0a0a0b',
        'surface-lighter': '#121214',
        primary: {
          DEFAULT: '#ffffff',
          hover: '#f8fafc',
          muted: '#94a3b8',
        },
        secondary: {
          DEFAULT: '#6366f1', // Indigo
          hover: '#4f46e5',
        },
        accent: {
          DEFAULT: '#a855f7', // Purple
          hover: '#9333ea',
        },
        card: {
          DEFAULT: 'rgba(255, 255, 255, 0.03)',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        'glass-white': 'rgba(255, 255, 255, 0.02)',
        'glass-border': 'rgba(255, 255, 255, 0.06)',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'monospace'],
        sans: ['"Inter"', 'sans-serif'],
      },
      boxShadow: {
        'glow-primary': '0 0 20px rgba(99, 102, 241, 0.15)',
        'glow-accent': '0 0 20px rgba(168, 85, 247, 0.15)',
        'premium': '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      },
      borderRadius: {
        '2xl': '1.25rem',
        '3xl': '1.75rem',
        '4xl': '2.5rem',
      },
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'aura-loop': {
          '0%, 100%': { opacity: 0.4, transform: 'scale(1) translate(0, 0)' },
          '33%': { opacity: 0.6, transform: 'scale(1.1) translate(10px, -20px)' },
          '66%': { opacity: 0.5, transform: 'scale(0.9) translate(-10px, 20px)' },
        },
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'aura': 'aura-loop 15s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}