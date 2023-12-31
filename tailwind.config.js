/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyclistGreen: "#5CC88D",
        pedestrianOrange: "#EEA550",
        transitBlue: "#31CDDC",
        mainBlue: "#043760"
      },
    },
  },
  plugins: [],
}

