/**
 * KoliGo Design System — Uber-Inspired Color Palette
 *
 * Pure Uber DNA: Black primary, white contrast, green for success.
 * High-contrast, bold, minimal. Black is the brand.
 */

const Colors = {
  light: {
    // Brand — Pure Uber black
    primary: "#000000",
    primaryLight: "#333333",

    // Accent — Uber Green (success/delivery)
    accent: "#06C167",
    accentLight: "#2ED47A",

    // Warm accent — for urgency
    accentWarm: "#FF6B00",
    accentWarmLight: "#FF8A3D",

    // Semantic
    success: "#06C167",
    warning: "#F5A623",
    danger: "#E11900",
    info: "#276EF1",

    // Backgrounds — Uber whites
    background: "#FFFFFF",
    surface: "#FFFFFF",
    surfaceSecondary: "#F6F6F6",
    surfaceElevated: "#FFFFFF",

    // Text
    text: "#000000",
    textSecondary: "#545454",
    textTertiary: "#AFAFAF",

    // Borders
    border: "#E2E2E2",
    borderLight: "#F0F0F0",

    // Navigation
    tint: "#000000",
    tabIconDefault: "#AFAFAF",
    tabIconSelected: "#000000",

    // Status
    statusPending: "#F5A623",
    statusDelivered: "#06C167",
    statusFailed: "#E11900",
    statusInProgress: "#276EF1",

    // Effects
    overlay: "rgba(0, 0, 0, 0.04)",
    shadow: "rgba(0, 0, 0, 0.08)",
    shadowMedium: "rgba(0, 0, 0, 0.14)",

    // Gradients
    gradientStart: "#000000",
    gradientEnd: "#1A1A2E",
  },
  dark: {
    // Brand
    primary: "#FFFFFF",
    primaryLight: "#E5E5E5",

    // Accent
    accent: "#06C167",
    accentLight: "#2ED47A",

    // Warm accent
    accentWarm: "#FF8A3D",
    accentWarmLight: "#FFAD6E",

    // Semantic
    success: "#06C167",
    warning: "#FFC043",
    danger: "#FF4D4F",
    info: "#5B91F5",

    // Backgrounds — Uber deep dark
    background: "#000000",
    surface: "#141414",
    surfaceSecondary: "#1F1F1F",
    surfaceElevated: "#1F1F1F",

    // Text
    text: "#FFFFFF",
    textSecondary: "#B0B0B0",
    textTertiary: "#6B6B6B",

    // Borders
    border: "rgba(255, 255, 255, 0.12)",
    borderLight: "rgba(255, 255, 255, 0.06)",

    // Navigation
    tint: "#FFFFFF",
    tabIconDefault: "#6B6B6B",
    tabIconSelected: "#FFFFFF",

    // Status
    statusPending: "#FFC043",
    statusDelivered: "#06C167",
    statusFailed: "#FF4D4F",
    statusInProgress: "#5B91F5",

    // Effects
    overlay: "rgba(0, 0, 0, 0.6)",
    shadow: "rgba(0, 0, 0, 0.4)",
    shadowMedium: "rgba(0, 0, 0, 0.5)",

    // Gradients
    gradientStart: "#1A1A2E",
    gradientEnd: "#000000",
  },
};

export type ThemeColors = typeof Colors.light;

export function getColors(isDark: boolean): ThemeColors {
  return isDark ? Colors.dark : Colors.light;
}

export default Colors;
