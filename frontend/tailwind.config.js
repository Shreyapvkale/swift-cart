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
          DEFAULT: '#0A9E5C', // fresh green
          dark: '#08824B',
          light: '#E6F6EF',
        },
        accent: {
          DEFAULT: '#FF6B35', // warm orange
          dark: '#E0531D',
          light: '#FFF0EA',
        },
        dark: '#111827',
        mid: '#6B7280',
        lightBg: '#F9FAFB',
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        syne: ['Syne', 'sans-serif'],
        dmsans: ['"DM Sans"', 'sans-serif'],
      },
      borderRadius: {
        card: '12px',
        btn: '8px',
        pill: '999px',
      },
      boxShadow: {
        subtle: '0 2px 8px rgba(0,0,0,0.08)',
        hover: '0 8px 24px rgba(0,0,0,0.12)',
      }
    },
  },
  plugins: [],
}
