import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class", "[data-theme='dark']"],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: "#FAFAF8",
          dark:    "#F0ECE3",
        },
        ink: {
          DEFAULT: "#1a1a1a",
          soft:    "#333333",
        },
        muted: "#888888",
        border: "#E8E8E4",
        gold: {
          DEFAULT: "#B8860B",
          light:   "#D4A820",
        },
        "red-sale": "#E53935",
      },
      fontFamily: {
        playfair: ["Playfair Display", "Georgia", "serif"],
        dmsans:   ["DM Sans", "system-ui", "sans-serif"],
        sans:     ["DM Sans", "system-ui", "sans-serif"],
        serif:    ["Playfair Display", "Georgia", "serif"],
      },
      boxShadow: {
        card:        "0 2px 16px rgba(0, 0, 0, 0.05)",
        "card-raised": "0 12px 40px rgba(0, 0, 0, 0.10)",
        gold:        "0 8px 24px rgba(184, 134, 11, 0.28)",
        ink:         "0 8px 24px rgba(26, 26, 26, 0.22)",
      },
      borderRadius: {
        pill: "9999px",
      },
      animation: {
        marquee:  "marquee 28s linear infinite",
        fadeUp:   "fadeUp 0.6s ease forwards",
        float:    "float 4s ease-in-out infinite",
        shimmer:  "shimmer 1.8s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%":   { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-50%)" },
        },
        fadeUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-8px)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition:  "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
