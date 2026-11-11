import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: {
          bg: "#000000",
          surface: "#0a0a0a",
          "surface-2": "#141414",
          border: "#1f1f1f",
        },
        gold: {
          DEFAULT: "#d4af37",
          light: "#f4e4a8",
          dark: "#a38218",
        },
        text: {
          DEFAULT: "#e5e5e5",
          muted: "#737373",
        },
        success: "#10b981",
        danger: "#ef4444",
        warning: "#f59e0b",
        background: "#000000",
        foreground: "#e5e5e5",
        border: "#1f1f1f",
        input: "#1f1f1f",
        ring: "#d4af37",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      borderRadius: {
        lg: "0.625rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
