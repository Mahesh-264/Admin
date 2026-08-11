/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          400: '#f7de84',
          500: '#f1d15f',
          600: '#d6a400',
          700: '#b28700',
        },
      },
    },
  },
  plugins: [],
};
