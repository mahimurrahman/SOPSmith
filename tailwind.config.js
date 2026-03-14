/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./docs/**/*.{md,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        surface: "var(--surface)",
        "surface-strong": "var(--surface-strong)",
        "surface-muted": "var(--surface-muted)",
        border: "var(--border)",
        accent: "var(--accent)",
        "accent-foreground": "var(--accent-foreground)",
        success: "var(--success)",
        danger: "var(--danger)",
        ring: "var(--ring)",
      },
      fontSize: {
        display: ["clamp(2.8rem, 6vw, 4.8rem)", { lineHeight: "1", letterSpacing: "-0.04em" }],
        h1: ["clamp(2.2rem, 4vw, 3.5rem)", { lineHeight: "1.05", letterSpacing: "-0.03em" }],
        h2: ["clamp(1.75rem, 3vw, 2.5rem)", { lineHeight: "1.1", letterSpacing: "-0.025em" }],
        h3: ["1.5rem", { lineHeight: "1.2", letterSpacing: "-0.02em" }],
        body: ["1rem", { lineHeight: "1.75" }],
        label: ["0.95rem", { lineHeight: "1.5" }],
        meta: ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.18em" }],
      },
      spacing: {
        18: "4.5rem",
        22: "5.5rem",
        26: "6.5rem",
        30: "7.5rem",
        34: "8.5rem",
      },
      screens: {
        xs: "30rem",
        "3xl": "105rem",
      },
      boxShadow: {
        panel: "var(--shadow-panel)",
        soft: "var(--shadow-soft)",
      },
      borderRadius: {
        panel: "var(--radius-panel)",
        shell: "var(--radius-shell)",
      },
    },
  },
};
