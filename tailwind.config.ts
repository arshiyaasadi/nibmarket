import type { Config } from "tailwindcss";

// In Tailwind v4, spacing tokens are defined via --spacing-* in @theme (globals.css).
// This file is kept for content scanning and future plugin configuration only.
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  plugins: [],
};

export default config;
