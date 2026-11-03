/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        wepass: {
          50: '#F0F9F3',
          100: '#E8F3EC', // Required soft background tint
          200: '#C7E5D3',
          300: '#99D0B0',
          400: '#5CB383',
          500: '#05A85C', // Brand Green
          600: '#048D4D',
          700: '#036E3C',
          800: '#035831',
          900: '#024727',
        },
        weamber: {
          50: '#FFFBEB',
          100: '#FEF3C7',
          200: '#FDE68A',
          400: '#FBBF24',
          500: '#F59E0B', // Warm amber accent
          600: '#D97706',
          700: '#B45309',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          subtle: '#F8FAF9',
          muted: '#F1F5F2',
          card: '#FFFFFF',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      boxShadow: {
        'subtle': '0 2px 8px -2px rgba(5, 168, 92, 0.06), 0 1px 4px -1px rgba(0, 0, 0, 0.04)',
        'premium': '0 10px 30px -5px rgba(5, 168, 92, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
        'float': '0 20px 40px -10px rgba(5, 168, 92, 0.12), 0 8px 16px -4px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
};
