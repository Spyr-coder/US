/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Blending your favorite color (Blue) and hers (Purple/Indigo)
        hisBlue: '#2563eb',
        herPurple: '#9333ea',
      },
    },
  },
  plugins: [],
}