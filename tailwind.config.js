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
        // New Earthy Palette
        earth: {
          dark: "#4B2E17",        // Dark brown - text, borders, dark accents
          cream: "#FDF9F5",       // Very light cream - backgrounds
          orange: "#E47B35",     // Orange - primary actions
          khaki: "#B8A76A",      // Khaki/olive - secondary accents, tags
          gray: "#D8CFC6",       // Light gray/beige - borders, subtle backgrounds
        },
        brand: {
          DEFAULT: "#E47B35",
          50: "#FDF9F5",
          100: "#D8CFC6",
          200: "#B8A76A",
          300: "#E47B35",
          400: "#4B2E17",
          500: "#E47B35",
          600: "#D16A2A",
          700: "#4B2E17",
          800: "#3A2412",
          900: "#2A1A0D"
        },
        surface: {
          50: "#FDF9F5",
          100: "#FFFFFF",
          200: "#FAF7F5",
          300: "#D8CFC6",
          800: "#4B2E17"
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
  