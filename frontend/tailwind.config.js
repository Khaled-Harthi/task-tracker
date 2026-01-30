/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary - Black shades
        primary: {
          DEFAULT: '#0a0a0a',
          50: '#262626',
          100: '#1f1f1f',
          200: '#171717',
          300: '#0f0f0f',
          400: '#0a0a0a',
          500: '#050505',
          600: '#000000',
        },
        // Secondary - Coral shades
        coral: {
          DEFAULT: '#FF6B6B',
          50: '#FFE5E5',
          100: '#FFD4D4',
          200: '#FFB3B3',
          300: '#FF9292',
          400: '#FF8787',
          500: '#FF6B6B',
          600: '#FF4F4F',
          700: '#FF3333',
          800: '#E62E2E',
          900: '#CC2929',
        },
        // Surface colors
        surface: {
          DEFAULT: '#171717',
          light: '#262626',
          dark: '#0a0a0a',
        },
        // Text colors
        text: {
          primary: '#ffffff',
          secondary: '#a3a3a3',
          muted: '#737373',
        },
      },
      fontFamily: {
        arabic: ['IBM Plex Sans Arabic', 'sans-serif'],
        sans: ['Inter', 'IBM Plex Sans Arabic', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(255, 107, 107, 0.3)',
        'glow-sm': '0 0 10px rgba(255, 107, 107, 0.2)',
        'glow-lg': '0 0 40px rgba(255, 107, 107, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      backgroundImage: {
        'shimmer-gradient': 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
        'coral-gradient': 'linear-gradient(135deg, #FF6B6B 0%, #FF8787 100%)',
        'dark-gradient': 'radial-gradient(ellipse at top, #171717 0%, #0a0a0a 100%)',
      },
    },
  },
  plugins: [],
}
