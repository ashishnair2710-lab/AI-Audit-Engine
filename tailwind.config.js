/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // AdRevUp brand palette
        brand: {
          navy:    "#0F172A", // Primary — Deep SaaS dark navy
          green:   "#22C55E", // Accent — Growth green
          blue:    "#3B82F6", // Highlight — AI/intelligence blue
          bg:      "#F8FAFC", // Page background
          card:    "#1E293B", // Card background
          // Extended surface tones
          surface: "#0F172A",
          muted:   "#94A3B8",
          border:  "#334155",
          input:   "#1E293B",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 4px 24px 0 rgba(15,23,42,0.12)",
        glow: "0 0 20px 0 rgba(34,197,94,0.15)",
        "glow-blue": "0 0 20px 0 rgba(59,130,246,0.15)",
      },
      animation: {
        "spin-slow": "spin 2s linear infinite",
        "fade-in": "fadeIn 0.4s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        fadeIn:  { "0%": { opacity: 0 },              "100%": { opacity: 1 } },
        slideUp: { "0%": { opacity: 0, transform: "translateY(16px)" }, "100%": { opacity: 1, transform: "translateY(0)" } },
      },
    },
  },
  plugins: [],
};
