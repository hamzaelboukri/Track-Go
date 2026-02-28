const Colors = {
  light: {
    primary: "#16314f",
    primaryLight: "#2b5a86",
    accent: "#F36E18",
    accentLight: "#F79A40",
    success: "#27B961",
    warning: "#E8BE07",
    danger: "#DE4238",
    info: "#2F86D1",
    background: "#F6F8FB",
    surface: "#FFFFFF",
    surfaceSecondary: "#F0F4FA",
    text: "#161825",
    textSecondary: "#6A7786",
    textTertiary: "#98A6B4",
    border: "#E6EDF6",
    borderLight: "#F5F8FB",
    tint: "#1B3A5C",
    tabIconDefault: "#9EAAB8",
    tabIconSelected: "#1B3A5C",
    statusPending: "#F27B20",
    statusDelivered: "#2ECC71",
    statusFailed: "#E74C3C",
    statusInProgress: "#3498DB",
    overlay: "rgba(0, 0, 0, 0.45)",
    shadow: "rgba(22, 49, 79, 0.09)",
  },
  dark: {
    primary: "#63A5E8",
    primaryLight: "#81BEF4",
    accent: "#F6A54C",
    accentLight: "#F8BF70",
    success: "#28C46A",
    warning: "#E6C70C",
    danger: "#E04B40",
    info: "#6FB6EA",
    background: "#0B0F14",
    surface: "#14181D",
    surfaceSecondary: "#1E2328",
    text: "#E9F2FA",
    textSecondary: "#8A93A0",
    textTertiary: "#6B7380",
    border: "#2B3136",
    borderLight: "#1E2328",
    tint: "#4A9EE5",
    tabIconDefault: "#6E7681",
    tabIconSelected: "#4A9EE5",
    statusPending: "#F5993D",
    statusDelivered: "#2ECC71",
    statusFailed: "#E74C3C",
    statusInProgress: "#5DADE2",
    overlay: "rgba(0, 0, 0, 0.72)",
    shadow: "rgba(0, 0, 0, 0.32)",
  },
};

export type ThemeColors = typeof Colors.light;

export function getColors(isDark: boolean): ThemeColors {
  return isDark ? Colors.dark : Colors.light;
}

export default Colors;
