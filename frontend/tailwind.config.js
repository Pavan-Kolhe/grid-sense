/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./types/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        orbitron: ["Orbitron", "monospace"],
        "mono-tech": ["Share Tech Mono", "monospace"],
        exo: ["Exo 2", "sans-serif"],
      },
      colors: {
        void: "#030712",
        panel: "rgba(8, 15, 35, 0.85)",
      },
      animation: {
        "green-pulse": "greenPulse 2s ease-in-out infinite",
        "red-pulse": "redPulse 3s ease-in-out infinite",
        "border-glow": "borderGlow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
