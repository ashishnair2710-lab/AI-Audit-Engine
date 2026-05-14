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
          navy:       "#0F172A",   // Deep SaaS dark navy — primary dark
          card:       "#1E293B",   // Dark card surface
          cardborder: "#334155",   // Border on dark cards
          accent:     "#22C55E",   // Growth green — primary action
          accenthov:  "#16A34A",   // Green hover state
          blue:       "#3B82F6",   // Intelligence blue — data / links
          bluehov:    "#2563EB",   // Blue hover
          bg:         "#F8FAFC",   // Page background
          surface:    "#F1F5F9",   // Slightly darker page surface
          white:      "#FFFFFF",
          border:     "#E2E8F0",   // Light border (light bg areas)
          text:       "#111827",   // Dark text (light bg areas)
          subtext:    "#374151",
          muted:      "#6B7280",   // Muted text (light bg areas)
          red:        "#EF4444",
          orange:     "#F97316",
          yellow:     "#EAB308",
          green:      "#22C55E",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card:      "0 1px 4px 0 rgba(0,0,0,0.25), 0 1px 2px -1px rgba(0,0,0,0.2)",
        lifted:    "0 4px 24px 0 rgba(34,197,94,0.15)",
        glow:      "0 0 24px 0 rgba(34,197,94,0.25)",
        "glow-blue":"0 0 24px 0 rgba(59,130,246,0.2)",
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
