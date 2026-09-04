// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        omni: {
          dark: '#0B0F19', 
          surface: '#111827', 
          border: '#1F2937',
          accent: '#3B82F6', 
          success: '#10B981', 
          danger: '#EF4444',
        }
      }
    },
  },
  plugins: [],
}