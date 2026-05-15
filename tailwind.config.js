/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0a1628',
        teal: {
          DEFAULT: '#0e7c72',
          light: '#12a89b',
        },
        'off-white': '#f5f7f8',
        'warm-grey': '#e8ecef',
        text: '#1a2b3c',
        muted: '#5a6b7a',
        tertiary: '#6C737B',
      },
      fontFamily: {
        heading: ['Century Gothic', 'CenturyGothic', 'AppleGothic', 'sans-serif'],
        body: ['Century Gothic', 'CenturyGothic', 'AppleGothic', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

