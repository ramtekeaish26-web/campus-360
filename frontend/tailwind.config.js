/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Stitch Design System - Academic Vanguard Palette
        "primary": "#0F2137",
        "primary-container": "#0F2137",
        "primary-fixed": "#D4E3FF",
        "primary-fixed-dim": "#B6C8E4",
        "on-primary": "#FFFFFF",
        "on-primary-container": "#7889A4",
        "on-primary-fixed": "#091C32",
        "on-primary-fixed-variant": "#374860",

        "secondary": "#E05822",
        "secondary-container": "#FF6E38",
        "secondary-fixed": "#FFDBCF",
        "secondary-fixed-dim": "#FFB59C",
        "on-secondary": "#FFFFFF",
        "on-secondary-container": "#601B00",
        "on-secondary-fixed": "#390C00",
        "on-secondary-fixed-variant": "#822800",

        "tertiary": "#059669",
        "tertiary-container": "#002618",
        "tertiary-fixed": "#85F8C4",
        "tertiary-fixed-dim": "#68DBA9",
        "on-tertiary": "#FFFFFF",
        "on-tertiary-container": "#139A6D",
        "on-tertiary-fixed": "#002114",
        "on-tertiary-fixed-variant": "#005137",

        "surface": "#F8FAFC",
        "surface-bright": "#F8FAFC",
        "surface-dim": "#CBDBF5",
        "surface-variant": "#D3E4FE",
        "surface-container-lowest": "#FFFFFF",
        "surface-container-low": "#EFF4FF",
        "surface-container": "#E5EEFF",
        "surface-container-high": "#DCE9FF",
        "surface-container-highest": "#D3E4FE",
        "surface-tint": "#4F5F78",

        "on-surface": "#0B1C30",
        "on-surface-variant": "#64748B",
        "on-background": "#0B1C30",
        "background": "#F8FAFC",

        "outline": "#CBD5E1",
        "outline-variant": "#C4C6CD",

        "error": "#BA1A1A",
        "error-container": "#FFDAD6",
        "on-error": "#FFFFFF",
        "on-error-container": "#93000A",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        display: ["'Plus Jakarta Sans'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.5rem",
        md: "0.75rem",
        lg: "0.75rem",
        xl: "1rem",
        "2xl": "1.5rem",
        full: "9999px",
      },
      spacing: {
        "space-xs": "0.25rem",
        "space-sm": "0.5rem",
        "space-md": "1rem",
        "space-lg": "1.5rem",
        "space-xl": "2.5rem",
      },
      boxShadow: {
        sm: "0 1px 3px rgba(15, 33, 55, 0.06)",
        DEFAULT: "0 4px 12px -2px rgba(15, 33, 55, 0.06), 0 2px 4px -1px rgba(15, 33, 55, 0.04)",
        md: "0 8px 16px -4px rgba(15, 33, 55, 0.08), 0 4px 6px -2px rgba(15, 33, 55, 0.04)",
        lg: "0 20px 25px -5px rgba(15, 33, 55, 0.1), 0 8px 10px -6px rgba(15, 33, 55, 0.04)",
      },
    },
  },
  plugins: [],
};
