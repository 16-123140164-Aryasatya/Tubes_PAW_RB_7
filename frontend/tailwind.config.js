/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    screens: {
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1d4ed8',
          50: '#f0f7ff',
          100: '#e0eaff',
          200: '#c7d9ff',
          300: '#a4bfff',
          400: '#7b9dff',
          500: '#5b7bff',
          600: '#137fec',
          700: '#1550d3',
          800: '#1240aa',
          900: '#123688',
          hover: '#0e67c4',
          light: '#e3f2fd',
          dark: '#0a4599',
        },
        success: {
          DEFAULT: '#16a34a',
          light: '#eaf8ef',
          dark: '#15803d',
        },
        error: {
          DEFAULT: '#ef4444',
          light: '#ffecec',
          dark: '#dc2626',
        },
        warning: {
          DEFAULT: '#f59e0b',
          light: '#fff3d9',
          dark: '#d97706',
        },
        info: {
          DEFAULT: '#0ea5e9',
          light: '#ecf9ff',
          dark: '#0284c7',
        },
        background: {
          light: '#ffffff',
          DEFAULT: '#f5f7fb',
          dark: '#0f172a',
        },
        surface: {
          light: '#f8fbff',
          DEFAULT: '#ffffff',
          dark: '#1e293b',
        },
        border: {
          light: '#e6edf6',
          DEFAULT: '#d7e2f1',
          dark: '#334155',
        },
        text: {
          primary: '#0f172a',
          secondary: '#6b7280',
          tertiary: '#9ca3af',
          inverse: '#ffffff',
        },
      },
      fontFamily: {
        display: ['Manrope', 'sans-serif'],
      },
      borderRadius: {
        'sm': '0.25rem',
        'md': '0.5rem',
        'lg': '0.75rem',
      },
      spacing: {
        'xs': '0.25rem',
        'sm': '0.5rem',
        'md': '1rem',
        'lg': '1.5rem',
        'xl': '2rem',
      },
    },
  },
  plugins: [],
}

