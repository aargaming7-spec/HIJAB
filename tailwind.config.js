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
          50: '#F6F0F2',
          100: '#EBDCE1',
          200: '#D4B4C0',
          300: '#B98A9C',
          400: '#9C6478',
          500: '#7E4A5D',
          600: '#623A4A',
          700: '#4C2C3A',
          800: '#38202A',
          900: '#25151C',
        },
        gold: '#C6A15B',
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
