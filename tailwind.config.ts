import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'github-dark': {
          DEFAULT: '#0D1117',
          'text': '#C9D1D9',
          'border': '#30363D',
          'input': '#1E2228',
          'hover': '#21262D',
        },
        'github-light': {
          DEFAULT: '#FFFFFF',
          'text': '#24292E',
          'border': '#E1E4E8',
          'input': '#FAFBFC',
          'hover': '#F6F8FA',
        },
      },
    },
  },
  plugins: [],
};
export default config;
