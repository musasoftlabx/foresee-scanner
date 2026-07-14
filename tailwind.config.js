/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["JetBrainsMono-Regular", "system-ui", "sans-serif"],
        mono: ["JetBrainsMono-Regular"],
        display: ["JetBrainsMono-Regular"],
        body: ["JetBrainsMono-Regular"],
      },
    },
  },
  plugins: [],
};
