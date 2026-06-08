import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        pitch: "#0F766E",
        night: "#111827",
        gold: "#F59E0B"
      }
    }
  },
  plugins: []
};

export default config;
