/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "hsl(215, 15%, 92%)",
        accent: "hsl(40, 95%, 55%)",
        primary: "hsl(206, 90%, 40%)",
        surface: "hsl(215, 15%, 98%)",
        "text-primary": "hsl(215, 20%, 15%)",
        "text-secondary": "hsl(215, 10%, 40%)",
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "16px",
        xl: "24px",
      },
      boxShadow: {
        card: "0 4px 12px hsla(215, 20%, 15%, 0.08)",
        focus: "0 0 0 3px hsla(40, 95%, 55%, 0.5)",
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "12px",
        lg: "20px",
        xl: "28px",
      },
      fontSize: {
        caption: ["0.875rem", { fontWeight: "500" }],
        body: ["1rem", { lineHeight: "1.5rem", fontWeight: "400" }],
        heading: ["1.5rem", { fontWeight: "600" }],
        display: ["1.875rem", { fontWeight: "700" }],
      },
      transitionTimingFunction: {
        ease: "cubic-bezier(0.22,1,0.36,1)",
      },
      transitionDuration: {
        fast: "150ms",
        base: "250ms",
        slow: "400ms",
      },
    },
  },
  plugins: [],
};
  