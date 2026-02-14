/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"JetBrains Mono"', "monospace"],
        syne: ["Syne", "sans-serif"],
      },
      colors: {
        "custom-bg": "var(--color-bg)",
        "custom-surface": "var(--color-surface)",
        "custom-surface2": "var(--color-surface2)",
        "custom-border": "var(--color-border)",
        "custom-accent": "var(--color-accent)",
        "custom-accent2": "var(--color-accent2)",
        "custom-accent3": "var(--color-accent3)",
        "custom-text": "var(--color-text)",
        "custom-text-dim": "var(--color-text-dim)",
        "custom-text-bright": "var(--color-text-bright)",
      },
    },
  },
  plugins: [],
};
