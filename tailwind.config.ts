import type { Config } from "tailwindcss";

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'], 
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'blue-light': '#1447e6',
        'blue-dark': '#51a2ff',
        'red-light': '#e7000b',
        'red-dark': '#fb2c36',
        'yellow-light': '#E6B120',
        'yellow-dark': '#F0B000',
        'green-light': '#00a63e',
        'green-dark': '#00c951',
        'primary-light': '#f5f5f4',
        'secondary-light': '#e7e5e4',
        'tertiary-light': '#d6d3d1',
        'primary-dark': '#0c0a09',
        'secondary-dark': '#1c1917',
        'tertiary-dark': '#292524',
        'quaternary': '#79716b',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
      },
      screens: {
        '3xl': '1920px',
      },
    },
  },
  plugins: [],
};
export default config;