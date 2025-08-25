/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./client/src/**/*.{js,ts,jsx,tsx}",
    "./client/index.html"
  ],
  theme: {
    extend: {
      colors: {
        background: "#ffffff",  // for bg-background
        border: "#e5e7eb",      // for border-border
        foreground: "#111827"   // for text-foreground
      }
    }
  },
  plugins: []
};
