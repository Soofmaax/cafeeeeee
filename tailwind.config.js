/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      screens: {
        xs: '400px',
      },
      colors: {
        ink: {
          50: '#f7f7f6',
          100: '#eeeae7',
          200: '#d8d2cc',
          300: '#b3a9a0',
          400: '#8a7d72',
          500: '#6b5e54',
          600: '#564a42',
          700: '#453b35',
          800: '#2f2824',
          900: '#1a1613',
          950: '#0d0b09',
        },
        accent: {
          400: '#c9a24a',
          500: '#b08a32',
          600: '#92722a',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
