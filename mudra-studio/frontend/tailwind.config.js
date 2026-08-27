/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#420A10',
        inkDeep: '#370A0B',
        gold: '#C0912E',
        khaali: '#9C8F7E',
        cream: '#F5F1E1',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['Manrope', 'sans-serif'],
        devanagari: ["'Noto Serif Devanagari'", 'serif'],
      },
    },
  },
  plugins: [],
};
