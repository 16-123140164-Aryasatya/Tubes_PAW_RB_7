module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: "#137fec",
        "primary-hover": "#106ac4",
        "background-light": "#f6f7f8",
        "background-dark": "#101922",
        "surface-light": "#ffffff",
        "surface-dark": "#1a2632",
        "border-light": "#e7edf3",
        "border-dark": "#2a3b4d",
        "text-main-light": "#0d141b",
        "text-main-dark": "#e0e6ed",
        "text-sub-light": "#4c739a",
        "text-sub-dark": "#94a3b8",
      },
      fontFamily: {
        display: ["Manrope", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
      },
    },
  },
  plugins: [],
};
