/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { 50:'#FBF1EE',100:'#F6DDD4',200:'#F0C5B5',300:'#E8A593',400:'#E18972',500:'#D96E54',600:'#BE5840',700:'#9C4733',800:'#7A3727',900:'#52271B' },
        sage:    { 50:'#EEF4EE',100:'#D9E6D8',200:'#B8CDB6',300:'#94B392',400:'#789C76',500:'#5B8C5A',600:'#4A7649',700:'#3F6A3E',800:'#2D4D2C',900:'#1B311B' },
        ink:     { 50:'#FAFAF7',100:'#F2F1EC',200:'#E5E3DC',300:'#CFCCC1',400:'#9C988C',500:'#7A7770',600:'#5A5750',700:'#3F3D38',800:'#2B2925',900:'#161513' },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: { xl:'1rem', '2xl':'1.25rem', '3xl':'1.5rem' },
      boxShadow: {
        'soft-sm': '0 2px 6px rgba(20,18,15,0.06)',
        'soft':    '0 6px 16px rgba(20,18,15,0.08)',
        'soft-lg': '0 12px 28px rgba(20,18,15,0.10)',
      },
    },
  },
  plugins: [],
};
