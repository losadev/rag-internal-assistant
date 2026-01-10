import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        "primary-light": "var(--color-primary-light)",
        app: "var(--color-background)",
        card: "var(--color-card)",
        muted: "var(--color-muted)",
        icon: "var(--color-icon-bg)",
        border: "var(--color-border)",
        accent: "var(--color-accent)",
      },
      backgroundColor: {
        app: "var(--color-background)",
        card: "var(--color-card)",
        primary: "var(--color-primary)",
        "primary-light": "var(--color-primary-light)",
        muted: "var(--color-muted)",
        icon: "var(--color-icon-bg)",
      },
      borderColor: {
        app: "var(--color-border)",
      },
      textColor: {
        app: "var(--color-foreground)",
        muted: "var(--color-muted)",
        primary: "var(--color-primary)",
        "primary-light": "var(--color-primary-light)",
      },
    },
  },
  plugins: [],
};

export default config;
