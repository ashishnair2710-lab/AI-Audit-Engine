/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple:  "#7C3AED",
          purple2: "#6D28D9",
          lavender:"#EDE9FE",
          navy:    "#1E1B4B",
          bg:      "#F8FAFC",
          white:   "#FFFFFF",
          card:    "#FFFFFF",
          border:  "#E5E7EB",
          muted:   "#6B7280",
          text:    "#111827",
          subtext: "#374151",
          blue:    "#3B82F6",
          red:     "#EF4444",
          orange:  "#F97316",
          yellow:  "#EAB308",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card:   "0 1px 3px 0 rgba(0,0,0,0.08), 0 1px 2px -1px rgba(0,0,0,0.06)",
        lifted: "0 4px 20px 0 rgba(124,58,237,0.12)",
        glow:   "0 0 24px 0 rgba(124,58,237,0.18)",
      },
      animation: {
        "fade-in":  "fadeIn 0.35s ease-out",
        "slide-up": "slideUp 0.4s ease-out",
        "spin-slow":"spin 1.5s linear infinite",
      },
      keyframes: {
        fadeIn:  { "0%": { opacity: 0 }, "100%": { opacity: 1 } },
        slideUp: { "0%": { opacity: 0, transform: "translateY(12px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};
