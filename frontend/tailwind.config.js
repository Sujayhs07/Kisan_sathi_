/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          950: '#031f16',
          900: '#063928',
          800: '#0a4f38',
          700: '#0f684a',
          600: '#15805d',
        },
        maroon: {
          900: '#480f1b',
          800: '#5a1322',
          700: '#691828',
          600: '#7d1e31',
          500: '#94263c',
        },
        cream: {
          50: '#fdfbf7',
          100: '#faf6ef',
          200: '#f4ede1',
          300: '#ebdccb',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
