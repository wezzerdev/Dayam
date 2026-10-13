import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        glam: {
          50: "#FFF1F5",
          100: "#FFE4EC",
          200: "#FECDDC",
          300: "#FBA1BF",
          400: "#F66597",
          500: "#EE2F74", // Vibrant Hot Magenta / Pink Chic
          600: "#D9165C",
          700: "#B80C4B",
          800: "#990E41",
          900: "#7F1139",
        },
        rose: {
          50: "#FFF1F2",
          100: "#FFE4E6",
          200: "#FECDD3",
          300: "#FDA4AF",
          400: "#FB7185",
          500: "#F43F5E",
          600: "#E11D48",
          700: "#BE123C",
          800: "#9F1239",
          900: "#881337",
        },
        gold: {
          light: "#FEF3C7",
          champagne: "#F59E0B",
          rich: "#D97706",
          metallic: "#FBBF24",
        },
        dark: {
          light: "#3F3F46",
          DEFAULT: "#18181B",
          rich: "#09090B",
        },
      },
      fontFamily: {
        serif: ["var(--font-playfair)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(238, 47, 116, 0.08)",
        card: "0 10px 30px -4px rgba(238, 47, 116, 0.12)",
        hover: "0 20px 35px -5px rgba(238, 47, 116, 0.2)",
        glow: "0 0 25px rgba(238, 47, 116, 0.35)",
      },
      borderRadius: {
        lg: "1.25rem",
        md: "0.875rem",
        sm: "0.5rem",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-out forwards",
        "slide-up": "slideUp 0.3s ease-out forwards",
        "slide-left": "slideLeft 0.3s ease-out forwards",
        bounce: "bounce 1s infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideLeft: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
