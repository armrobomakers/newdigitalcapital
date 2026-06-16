import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 0 0 1px rgba(181, 133, 255, 0.15), 0 20px 80px rgba(72, 28, 165, 0.32)",
        soft: "0 18px 50px rgba(2, 3, 12, 0.45)",
      },
      colors: {
        ink: {
          950: "#04030d",
          900: "#060417",
          850: "#08061c",
        },
        violet: {
          500: "#7c3cff",
          400: "#9b66ff",
          300: "#b285ff",
        },
        gold: {
          300: "#f1c268",
        },
      },
      backgroundImage: {
        "premium-radial":
          "radial-gradient(circle at top, rgba(124, 60, 255, 0.28), transparent 28%), radial-gradient(circle at 85% 10%, rgba(178, 133, 255, 0.18), transparent 26%), radial-gradient(circle at 50% 100%, rgba(241, 194, 104, 0.08), transparent 24%)",
      },
      borderRadius: {
        "3xl": "1.75rem",
      },
    },
  },
  plugins: [],
};

export default config;
