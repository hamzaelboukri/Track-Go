/**
 * KoliGo Typography — Outfit Font System
 * High-end, geometric, professional.
 */

export const typography = {
  fontFamily: {
    regular: "Outfit_400Regular",
    medium: "Outfit_500Medium",
    semibold: "Outfit_600SemiBold",
    bold: "Outfit_700Bold",
    extrabold: "Outfit_800ExtraBold",
    black: "Outfit_900Black",
  },
  size: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 16,
    lg: 18,
    xl: 22,
    "2xl": 28,
    "3xl": 34,
    "4xl": 42,
  },
  weight: {
    regular: "Outfit_400Regular" as any,
    medium: "Outfit_500Medium" as any,
    semibold: "Outfit_600SemiBold" as any,
    bold: "Outfit_700Bold" as any,
    extrabold: "Outfit_800ExtraBold" as any,
    black: "Outfit_900Black" as any,
  },
  lineHeight: {
    tight: 1.1,
    snug: 1.2,
    normal: 1.35,
    relaxed: 1.5,
    loose: 1.75,
  },
  letterSpacing: {
    tight: -0.5,
    snug: -0.3,
    normal: 0,
    wide: 0.3,
    wider: 0.6,
  },
};

export type Typography = typeof typography;
