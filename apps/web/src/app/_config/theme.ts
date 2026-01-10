/**
 * Configuración centralizada de tema
 * Colores, tipografía y espaciado reutilizable y escalable
 */

export const theme = {
  colors: {
    light: {
      primary: "oklch(0.45 0.15 250)",
      primaryLight: "oklch(0.6 0.18 250)",
      background: "oklch(0.99 0 0)",
      foreground: "oklch(0.18 0 0)",
      card: "oklch(1 0 0)",
      muted: "oklch(0.96 0 0)",
      border: "oklch(0.92 0.005 250)",
      accent: "oklch(0.6 0.18 250)",
    },
    dark: {
      primary: "oklch(0.6 0.18 250)",
      primaryLight: "oklch(0.7 0.2 250)",
      background: "oklch(0.145 0 0)",
      foreground: "oklch(0.985 0 0)",
      card: "oklch(0.2 0 0)",
      muted: "oklch(0.3 0 0)",
      border: "oklch(0.25 0.005 250)",
      accent: "oklch(0.7 0.2 250)",
    },
  },
  typography: {
    fontSans: '"Geist", system-ui, sans-serif',
    fontMono: '"Geist Mono", monospace',
  },
  spacing: {
    radiusDefault: "0.5rem", // 8px
  },
} as const;

export type ThemeType = typeof theme;

/**
 * Hook para obtener colores según el modo (luz/oscuridad)
 * Uso: const { primary, background } = useThemeColors();
 */
export function useThemeColors(isDark: boolean = false) {
  return isDark ? theme.colors.dark : theme.colors.light;
}

/**
 * Función para generar estilos dinámicos basados en el tema
 */
export function getThemeColor(
  colorName: keyof typeof theme.colors.light,
  isDark: boolean = false
): string {
  const colorMap = isDark ? theme.colors.dark : theme.colors.light;
  return colorMap[colorName] || "";
}

/**
 * Paleta de colores predefinida para componentes
 */
export const colorPalette = {
  interactive: {
    default: "var(--color-primary)",
    hover: "var(--color-primary-light)",
    disabled: "var(--color-muted)",
  },
  surface: {
    background: "var(--color-background)",
    card: "var(--color-card)",
    muted: "var(--color-muted)",
  },
  text: {
    primary: "var(--color-foreground)",
    muted: "var(--color-muted)",
  },
  border: {
    default: "var(--color-border)",
  },
  accent: {
    default: "var(--color-accent)",
  },
} as const;
