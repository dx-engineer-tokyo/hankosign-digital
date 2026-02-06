/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        hanko: {
          red: '#D32F2F',
          ink: '#B71C1C',
          light: '#FFCDD2',
        },
      },
      fontFamily: {
        japanese: ['Noto Sans JP', 'sans-serif'],
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        hankosign: {
          primary: '#D32F2F',
          secondary: '#1976D2',
          accent: '#FFA726',
          neutral: '#424242',
          'base-100': '#FFFFFF',
          'base-200': '#F5F5F5',
          'base-300': '#E0E0E0',
          info: '#2196F3',
          success: '#4CAF50',
          warning: '#FF9800',
          error: '#F44336',
        },
      },
    ],
  },
};
