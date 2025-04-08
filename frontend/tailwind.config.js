/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors:{
        'primary' : "#5f6FFF",
        // yellowColor : "#FEB60D",
        // purpleColor : "#9771FF",
        // irisBlueColor : "#01B5C5",
        // headingColor : "#181A1E",
        // textColor : "#4E545F"
      },
    },
  },
  plugins: [],
}

