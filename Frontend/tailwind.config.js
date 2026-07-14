/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-gold': '#C4A961',
        'dark-bg': '#0a0a0a',
        'card-bg': '#1a1a1a',
        'text-white': '#FFFFFF',
        'text-gray': '#999999',
        'text-light-gray': '#cccccc',
        'border-gold': 'rgba(196, 169, 97, 0.3)',
      },
      fontFamily: {
        sans: ['Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
      backgroundColor: {
        'dark-bg': '#0a0a0a',
        'card-bg': '#1a1a1a',
      },
      textColor: {
        'text-white': '#FFFFFF',
        'text-gray': '#999999',
        'text-light-gray': '#cccccc',
      },
      borderColor: {
        'border-gold': 'rgba(196, 169, 97, 0.3)',
      },
    },
  },
  safelist: [
    'bg-dark-bg',
    'bg-card-bg',
    'text-text-white',
    'text-text-gray',
    'text-text-light-gray',
    'text-primary-gold',
    'border-border-gold',
    'border-primary-gold',
    'hover:text-primary-gold',
    'hover:bg-primary-gold',
    'hover:border-primary-gold',
  ],
  plugins: [],
}
