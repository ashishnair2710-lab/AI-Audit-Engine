/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          purple:      "#6B5FE4",
          purplelight: "#8B7FF5",
          purplehov:   "#5A4FD4",
          yellow:      "#F5A623",
          yellowhov:   "#E09520",
          black:       "#111111",
          white:       "#FFFFFF",
          gray:        "#F5F5F5",
          border:      "#E5E5E5",
          muted:       "#9CA3AF",
          subtext:     "#374151",
          // backward-compat aliases
          navy:        "#111111",
          text:        "#111111",
          accent:      "#6B5FE4",
          accenthov:   "#5A4FD4",
          blue:        "#6B5FE4",
          bluehov:     "#5A4FD4",
          bg:          "#F5F5F5",
          surface:     "#FFFFFF",
          card:        "#FFFFFF",
          cardborder:  "#E5E5E5",
          red:         "#EF4444",
          orange:      "#F97316",
          green:       "#22C55E",
        },
      },
      fontFamily: {
        sans: ["var(--font-outfit)", "Outfit", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card:       "0 1px 3px 0 rgba(0,0,0,0.07), 0 1px 2px -1px rgba(0,0,0,0.04)",
        lifted:     "0 4px 24px 0 rgba(107,95,228,0.14)",
        glow:       "0 0 20px 0 rgba(107,95,228,0.18)",
        "glow-yel": "0 0 20px 0 rgba(245,166,35,0.18)",
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
