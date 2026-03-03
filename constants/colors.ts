const Colors = {
  light: {
    primary: "#1458FF",
    primaryLight: "#4C7CFF",
    accent: "#FF7B3A",
    accentLight: "#FFAC6A",
    success: "#35D48C",
    warning: "#F4C542",
    danger: "#FF4B5C",
    info: "#3AAEFF",
    background: "#F4F7FB",
    surface: "#FFFFFF",
    surfaceSecondary: "#E6EEFA",
    text: "#0E1726",
    textSecondary: "#5B6474",
    textTertiary: "#9AA3B5",
    border: "#D5E0F0",
    borderLight: "#ECF1FA",
    tint: "#1458FF",
    tabIconDefault: "#A0A9BA",
    tabIconSelected: "#1458FF",
    statusPending: "#FFB020",
    statusDelivered: "#1AD38A",
    statusFailed: "#FF4B5C",
    statusInProgress: "#3AAEFF",
    overlay: "rgba(10, 22, 50, 0.08)",
    shadow: "rgba(4, 20, 60, 0.10)",
  },
  dark: {
    primary: "#4C8CFF",
    primaryLight: "#6FA3FF",
    accent: "#FF8E4D",
    accentLight: "#FFB075",
    success: "#3BE49C",
    warning: "#FFCF5A",
    danger: "#FF5C70",
    info: "#4EC3FF",
    background: "#050712",
    surface: "rgba(10, 15, 30, 0.92)",
    surfaceSecondary: "rgba(18, 26, 48, 0.96)",
    text: "#F4F7FF",
    textSecondary: "#A7B3CC",
    textTertiary: "#6E7A92",
    border: "rgba(96, 115, 150, 0.6)",
    borderLight: "rgba(40, 60, 100, 0.85)",
    tint: "#4C8CFF",
    tabIconDefault: "#6E7A92",
    tabIconSelected: "#4C8CFF",
    statusPending: "#FFB347",
    statusDelivered: "#32E29A",
    statusFailed: "#FF5C70",
    statusInProgress: "#4EC3FF",
    overlay: "rgba(2, 6, 23, 0.78)",
    shadow: "rgba(0, 0, 0, 0.55)",
  },
};

export type ThemeColors = typeof Colors.light;

export function getColors(isDark: boolean): ThemeColors {
  return isDark ? Colors.dark : Colors.light;
}

export default Colors;
