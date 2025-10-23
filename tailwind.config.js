/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#0ea5e9',
          dark: '#0284c7',
          light: '#38bdf8'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        soft: '0 10px 30px rgba(2, 132, 199, 0.08)'
      }
    }
  },
  plugins: []
}