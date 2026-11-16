/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'st-cream': '#f6f1e4',
        'st-cream-dark': '#ece4cf',
        'st-white': '#ffffff',
        'st-primary': '#1f6f4a',
        'st-dark': '#14402c',
        'st-light': '#7fb58f',
        'st-pale': '#dcebd9',
        'st-text': '#17261e',
        'st-text-muted': '#5d6f64',
        brand: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
          950: '#052e16',
        }
      },
      fontFamily: {
        sora: ['Sora', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
