import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'sun': {
          50:  '#fff8f0',
          100: '#ffe5c0',
          400: '#f5a623',
          500: '#e8732a',
          600: '#c44d32',
          700: '#FF8C00',
          DEFAULT: '#FF8C00',
        },
        'dark': {
          50:  '#2a2a3a',
          100: '#1e1e2e',
          200: '#16162a',
          300: '#111118',
          400: '#0a0a0f',
        },
        'rose': '#FF4D6D',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
