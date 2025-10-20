/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        dark1: "#0f172a",
        dark2: "#111827",
        light: "#e5e7eb",
        accent: "#16a34a",
        accent2: "#22c55e",
        overlay: "#00000080"
      },
      boxShadow: {
        card: "0 8px 20px rgba(0,0,0,0.08)"
      },
      borderRadius: {
        xl: "14px"
      }
    }
  },
  plugins: []
}
