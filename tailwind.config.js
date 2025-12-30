/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        wa: {
          bg: '#f0f2f5',
          side: '#0b141a',
          accent: '#25D366',
          chatbg: '#e9edef',
          text: '#0b141a'
        }
      }
    },
  },
  plugins: [],
}
