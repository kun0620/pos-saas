/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        surface: '#f8f9ff',
        'surface-low': '#eef4ff',
        'surface-high': '#d9e3f4',
        'surface-white': '#ffffff',
        primary: '#2563eb',
        'primary-dark': '#004ac6',
        'on-surface': '#121c28',
      },
      fontFamily: {
        display: ['Be Vietnam Pro', 'sans-serif'],
        body: ['Plus Jakarta Sans', 'sans-serif'],
      },
    },
  },
  darkMode: 'class',
  plugins: [],
}
