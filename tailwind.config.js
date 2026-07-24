/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FFFFFF',
        mist: '#F6F3F0',
        ink: '#2A241F',
        mauve: {
          50: '#F7F1F1',
          100: '#EFE0E1',
          200: '#DCC0C1',
          300: '#C69EA0',
          400: '#AD7E80',
          500: '#96636A',
          600: '#7C4E56',
          700: '#623C43',
          800: '#452B31',
          900: '#2C1B1F',
        },
        gold: '#B5924F',
        line: '#E7E1DA',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      maxWidth: {
        container: '1360px',
      },
      letterSpacing: {
        widest2: '.22em',
      },
      transitionDuration: {
        250: '250ms',
        350: '350ms',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: 0, transform: 'translateY(14px)' },
          '100%': { opacity: 1, transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeUp: 'fadeUp .5s ease forwards',
      },
    },
  },
  plugins: [],
}
