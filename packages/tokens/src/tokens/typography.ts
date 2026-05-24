export const typography = {
  fontFamily: {
    sans: 'Inter, "Atkinson Hyperlegible", ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    display: '"Fraunces", "Cormorant Garamond", Georgia, serif',
    serif: 'Georgia, "Times New Roman", serif',
    mono: '"JetBrains Mono", "SFMono-Regular", Consolas, monospace',
  },
  size: {
    xs: "0.75rem",
    sm: "0.875rem",
    md: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "clamp(1.5rem, 1.5vw + 1rem, 2rem)",
    "3xl": "clamp(2rem, 2.8vw + 1rem, 3.25rem)",
    "4xl": "clamp(2.75rem, 5.5vw + 1rem, 5.5rem)",
  },
  lineHeight: {
    none: 1,
    tight: 1.08,
    snug: 1.22,
    normal: 1.62,
    relaxed: 1.75,
  },
  measure: {
    xs: "42ch",
    sm: "56ch",
    md: "68ch",
    lg: "78ch",
  },
  weight: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;

export type ArkaesTypographyScale = typeof typography;
