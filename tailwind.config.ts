import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        border: "var(--border)",
        fg: "var(--fg)",
        muted: "var(--muted)",
        primary: "var(--primary)",
        "primary-fg": "var(--primary-fg)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        info: "var(--info)",
        ring: "var(--ring)",
        "diff-add": "var(--diff-add)",
        "diff-add-line": "var(--diff-add-line)",
        "diff-del": "var(--diff-del)",
        "diff-del-line": "var(--diff-del-line)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        lg: "10px",
        md: "8px",
        sm: "6px",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.18s ease-out",
        shimmer: "shimmer 1.4s infinite",
      },
    },
  },
  plugins: [],
};
export default config;
