export const typography = {
  fontFamily: {
    heading: undefined as string | undefined,
    body: undefined as string | undefined,
    mono: undefined as string | undefined,
  },
  size: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 22,
    "2xl": 28,
    "3xl": 32,
  },
  weight: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
    extrabold: "800" as const,
  },
  lineHeight: {
    tight: 1.1,
    normal: 1.3,
    relaxed: 1.5,
  },
};

export type Typography = typeof typography;

