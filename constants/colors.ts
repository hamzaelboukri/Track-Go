const Colors = {
  light: {
    primary: "#1B3A5C",
    primaryLight: "#2A5A8C",
    accent: "#F27B20",
    accentLight: "#F5993D",
    success: "#2ECC71",
    warning: "#F1C40F",
    danger: "#E74C3C",
    info: "#3498DB",
    background: "#F5F7FA",
    surface: "#FFFFFF",
    surfaceSecondary: "#EDF1F7",
    text: "#1A1A2E",
    textSecondary: "#6B7B8D",
    textTertiary: "#9EAAB8",
    border: "#E0E6ED",
    borderLight: "#F0F3F7",
    tint: "#1B3A5C",
    tabIconDefault: "#9EAAB8",
    tabIconSelected: "#1B3A5C",
    statusPending: "#F27B20",
    statusDelivered: "#2ECC71",
    statusFailed: "#E74C3C",
    statusInProgress: "#3498DB",
    overlay: "rgba(0, 0, 0, 0.5)",
    shadow: "rgba(27, 58, 92, 0.08)",
  },
  dark: {
    primary: "#4A9EE5",
    primaryLight: "#6BB3F0",
    accent: "#F5993D",
    accentLight: "#F7B060",
    success: "#2ECC71",
    warning: "#F1C40F",
    danger: "#E74C3C",
    info: "#5DADE2",
    background: "#0D1117",
    surface: "#161B22",
    surfaceSecondary: "#21262D",
    text: "#F0F6FC",
    textSecondary: "#8B949E",
    textTertiary: "#6E7681",
    border: "#30363D",
    borderLight: "#21262D",
    tint: "#4A9EE5",
    tabIconDefault: "#6E7681",
    tabIconSelected: "#4A9EE5",
    statusPending: "#F5993D",
    statusDelivered: "#2ECC71",
    statusFailed: "#E74C3C",
    statusInProgress: "#5DADE2",
    overlay: "rgba(0, 0, 0, 0.7)",
    shadow: "rgba(0, 0, 0, 0.3)",
  },
};

export type ThemeColors = typeof Colors.light;

export function getColors(isDark: boolean): ThemeColors {
  return isDark ? Colors.dark : Colors.light;
}

export default Colors;
