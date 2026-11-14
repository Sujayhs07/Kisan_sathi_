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
          950: '#071e1c',
          900: '#0f3d3a', // ★ Exact Green from user image (#0F3D3A)
          800: '#17534f',
          700: '#1e6964',
          600: '#28817b',
          500: '#339c95',
          400: '#52b9b1',
          300: '#82d1cb',
          200: '#bbe8e4',
          100: '#e4f5f3',
          50: '#f2faf9',
        },
        maroon: {
          900: '#3b0b10',
          800: '#521016',
          700: '#6c151e', // ★ Exact Bordo from user image (#6C151E)
          600: '#861b26',
          500: '#a32431',
          100: '#f8ebeb',
          50: '#fdf7f7',
        },
        bordo: {
          900: '#3b0b10',
          800: '#521016',
          700: '#6c151e', // ★ Exact Bordo from user image (#6C151E)
          600: '#861b26',
          500: '#a32431',
          100: '#f8ebeb',
          50: '#fdf7f7',
        },
        cream: {
          500: '#d9ad84',
          400: '#e8c29d',
          300: '#f0d2b4',
          200: '#f5dabf', // ★ Exact Cream from user image (#F5DABF)
          100: '#f5dabf',
          50: '#faf0e6',
          25: '#fcf8f3',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Noto Sans Kannada"', '"Inter"', 'system-ui', 'sans-serif'],
        heading: ['"Plus Jakarta Sans"', '"Noto Sans Kannada"', 'system-ui', 'sans-serif'],
        serif: ['"Plus Jakarta Sans"', '"Noto Sans Kannada"', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
