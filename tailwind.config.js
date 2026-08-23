/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#111111',
        secondary: '#1B1B1B',
        accent: {
          DEFAULT: '#C69A52',
          hover: '#D8B06A',
        },
        surface: '#222222',
        light: {
          bg: '#F5F3EF',
          text: '#F7F7F5',
          muted: '#A7A7A2',
        },
        dark: {
          text: '#171717',
        },
      },
      fontFamily: {
        heading: ['"Bebas Neue"', 'sans-serif'],
        body: ['Manrope', 'sans-serif'],
      },
      fontSize: {
        'hero-desktop': 'clamp(4.5rem, 8vw, 6rem)',
        'hero-mobile': 'clamp(3rem, 10vw, 3.75rem)',
        'section': 'clamp(2.5rem, 5vw, 4rem)',
      },
    },
  },
  plugins: [],
};
