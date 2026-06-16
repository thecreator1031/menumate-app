/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0A0A0A",
          soft: "#0F0F0E",
        },
        surface: {
          DEFAULT: "#151513",
          raised: "#1C1C19",
          border: "#2B2B27",
        },
        accent: {
          50: "#ECFDF5",
          200: "#A7F3D0",
          400: "#34D399",
          500: "#22C55E",
          600: "#16A34A",
          900: "#064E3B",
        },
        saffron: {
          400: "#FBBF24",
          500: "#F59E0B",
        },
        coral: {
          400: "#FB7185",
          500: "#F43F5E",
        },
        ash: {
          100: "#F5F5F4",
          300: "#D4D4D2",
          400: "#A3A39E",
          500: "#7A7A74",
          600: "#54544F",
        },
      },
      fontFamily: {
        display: ["Space Grotesk", "sans-serif"],
        body: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        glow: "0 0 40px -10px rgba(52, 211, 153, 0.35)",
      },
    },
  },
  plugins: [],
};
