/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#094cb2',
          hover: '#084097',
          light: '#eef4fc',
          container: '#1c5fcc',
        },
        tertiary: {
          DEFAULT: '#6d5e00',
          hover: '#5c4f00',
          light: '#fdf8e2',
          container: '#fcf1b8',
        },
        surface: {
          lowest: '#FFFFFF',
          DEFAULT: '#F8F9FA',
          low: '#F2F4F7',
          container: '#EAEDF2',
          high: '#E1E5EB',
          highest: '#D8DCE4',
          dim: '#CFD4DE',
          card: '#FFFFFF',
        },
        outline: {
          ghost: 'rgba(140, 150, 175, 0.15)',
          subtle: 'rgba(140, 150, 175, 0.22)',
        },
        border: {
          DEFAULT: 'rgba(140, 150, 175, 0.15)',
          subtle: 'rgba(140, 150, 175, 0.10)',
        },
        content: {
          main: '#121826',
          muted: '#5A6578',
          subtle: '#8C96A5',
          link: '#094cb2',
        },
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
        label: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        serif: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        'btn': '8px',
        'card-sm': '10px',
        'card': '12px',
        'input': '8px',
        'chip': '96px',
      },
      boxShadow: {
        'subtle': '0 2px 10px -2px rgba(18, 24, 38, 0.04)',
        'modal': '0 30px 60px -15px rgba(18, 24, 38, 0.08)',
        'glass': '0 8px 32px 0 rgba(18, 24, 38, 0.06)',
      },
    },
  },
  plugins: [],
};
