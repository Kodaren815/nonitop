/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        pink: {
          DEFAULT: '#FF5CA2',
          light: '#FFE7F2',
          50: '#FFF5F9',
          100: '#FFE7F2',
          200: '#FFCCE3',
          300: '#FFB0D4',
          400: '#FF85BB',
          500: '#FF5CA2',
          600: '#E04889',
          700: '#C03570',
          800: '#A02357',
          900: '#80133F',
        },
        offwhite: '#FDF6F9',
        softgray: '#F2F2F2',
        charcoal: '#32273B',
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'Times New Roman', 'Times', 'serif'],
      },
    },
  },
  plugins: [],
}
