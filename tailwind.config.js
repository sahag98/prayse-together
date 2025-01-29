/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}', './modals/**/*.{js,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        card: 'var(--card)',
        cardborder: 'var(--cardborder)',
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        input: 'var(--input)',
        input_placeholder: 'var(--input-placeholder)',
      },
    },
  },
  plugins: [],
};
