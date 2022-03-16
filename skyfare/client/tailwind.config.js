/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}', './public/index.html'],
  theme: {
    extend: {
      colors: {
        // SkyFare accent — "sky blue" (the per-app accent from the brief).
        sky: {
          50: '#eff8ff',
          100: '#dbeefe',
          200: '#bfe2fe',
          300: '#93d0fd',
          400: '#60b6fa',
          500: '#3b98f5',
          600: '#2479ea',
          700: '#1c62d7',
          800: '#1d50ae',
          900: '#1d4689',
        },
      },
      fontFamily: {
        // Poppins for display, Inter for body — loaded in index.html.
        display: ['Poppins', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.9rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        soft: '0 6px 24px -8px rgba(29, 70, 137, 0.18)',
        card: '0 2px 10px -2px rgba(15, 23, 42, 0.08)',
        lift: '0 16px 40px -12px rgba(29, 70, 137, 0.30)',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.35s ease-out both',
      },
    },
  },
  plugins: [],
};
