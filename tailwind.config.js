/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1f93c1',
          light: '#3ba9d7',
          dark: '#167ba6',
        },
        success: {
          DEFAULT: '#10B981',
          light: '#34D399',
          dark: '#059669',
        }
      },
      fontFamily: {
        sans: ['Cabin', 'sans-serif'],
      },
    },
  },
  plugins: [],
} 