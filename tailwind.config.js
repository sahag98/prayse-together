/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}', './modals/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        light: {
          foreground: '#121212',
          background: '#FAF9F6',
          primary: '#FFD700',
          secondary: '#87CEEB',
          accent: '#FF6F61',
        },
        dark: {
          foreground: 'white',
          background: '#121212',
          primary: '#FFC107',
          secondary: '#4682B4',
          accent: '#FF7F6E',
        },
      },
    },
  },
  plugins: [],
};
