module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary, #6366f1)",
        "primary-hover": "var(--color-primary-hover, #4f46e5)",
        "text-main-light": "var(--color-text-main-light, #1f2937)",
        "text-main-dark": "var(--color-text-main-dark, #f3f4f6)",
        "text-sub-light": "var(--color-text-sub-light, #6b7280)",
        "text-sub-dark": "var(--color-text-sub-dark, #9ca3af)",
        "background-light": "var(--color-background-light, #f9fafb)",
        "background-dark": "var(--color-background-dark, #111827)",
        "surface-light": "var(--color-surface-light, #ffffff)",
        "surface-dark": "var(--color-surface-dark, #1f2937)",
        "border-light": "var(--color-border-light, #e5e7eb)",
        "border-dark": "var(--color-border-dark, #374151)",
      },
    },
  },
  plugins: [],
};
