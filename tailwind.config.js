/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        lg: "1120px",
        xl: "1280px"
      }
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji"],
      },
      colors: {
        brand: {
          DEFAULT: "#2563eb",
          50: "#eff6ff",
          100: "#dbeafe",
          200: "#bfdbfe",
          300: "#93c5fd",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a"
        },
        surface: {
          50: "#ffffff",
          100: "#f8fafc",
          200: "#f1f5f9",
          300: "#e2e8f0",
          800: "#0f172a"
        },
      },
      borderRadius: {
        xl: "14px",
        "2xl": "20px",
        pill: "999px",
      },
      boxShadow: {
        card: "0 8px 24px rgba(16,24,40,0.08)",
        soft: "0 4px 14px rgba(16,24,40,0.06)",
        focus: "0 0 0 4px rgba(37,99,235,0.25)",
      },
      backdropBlur: {
        xs: "2px"
      },
      transitionTimingFunction: {
        "ease-smooth": "cubic-bezier(.2,.8,.2,1)"
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/typography")
  ],
}
  