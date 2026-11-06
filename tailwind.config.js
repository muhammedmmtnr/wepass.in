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
          50: '#F4F8F5',
          100: '#E8F3EC',
          200: '#D5E4D9',
          300: '#B1C9B8',
          400: '#789A83',
          500: '#315F47',
          600: '#2A523D',
          700: '#244936',
          800: '#1C3B2B',
          900: '#172F23',
        },
        weamber: {
          50: '#FCF8EE',
          100: '#F5EBD1',
          200: '#EBD8A7',
          400: '#D6B66C',
          500: '#C9A858',
          600: '#AD8C43',
          700: '#8E7133',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          subtle: '#F8FAF9',
          muted: '#F3F6F3',
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
        'subtle': '0 2px 8px -2px rgba(37, 68, 47, 0.06), 0 1px 4px -1px rgba(0, 0, 0, 0.04)',
        'premium': '0 10px 30px -5px rgba(37, 68, 47, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
        'float': '0 20px 40px -10px rgba(37, 68, 47, 0.12), 0 8px 16px -4px rgba(0, 0, 0, 0.06)',
      }
    },
  },
  plugins: [],
};
