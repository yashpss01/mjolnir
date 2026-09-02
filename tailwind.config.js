/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#09090b', // Ultra dark background
        surface: '#121215',    // Card surface
        surfaceHighlight: '#1e1e24',
        border: '#27272a',
        primary: {
          DEFAULT: '#3b82f6',  // Vivid blue focus target
          hover: '#2563eb',
          accent: '#60a5fa'
        },
        success: {
          DEFAULT: '#22c55e',  // High contrast set complete green
          bg: '#14532d'
        },
        accent: {
          DEFAULT: '#f59e0b', // Gold for PRs
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
}
