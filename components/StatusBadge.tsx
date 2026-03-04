import React, { useEffect } from "react";
import { Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withSpring,
} from "react-native-reanimated";
import { useAppTheme } from "@/hooks/useAppTheme";
import { typography } from "@/constants/typography";
import type { ParcelStatusType } from "../shared/schema";
import { STATUS_LABELS } from "@/constants/labels";

interface StatusBadgeProps {
  status: ParcelStatusType;
  size?: "small" | "medium";
}

const StatusBadgeComponent = ({ status, size = "small" }: StatusBadgeProps) => {
  const { colors, isDark } = useAppTheme();
  const scale = useSharedValue(1);

  const config: Record<ParcelStatusType, { color: string; icon: keyof typeof Ionicons.glyphMap }> = {
    pending: { color: colors.statusPending, icon: "time" },
    in_progress: { color: colors.statusInProgress, icon: "navigate" },
    delivered: { color: colors.statusDelivered, icon: "checkmark-circle" },
    failed: { color: colors.statusFailed, icon: "alert-circle" },
  };

  const c = config[status];
  const isSmall = size === "small";

  useEffect(() => {
    scale.value = withSequence(
      withSpring(1.08, { damping: 14 }),
      withSpring(1, { damping: 14 })
    );
  }, [status, scale]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.badge,
        {
          backgroundColor: isDark ? "#0A0A0A" : "#F6F6F6",
          borderColor: c.color,
        },
        isSmall && styles.sm,
        animStyle
      ]}
    >
      <Ionicons name={c.icon} size={isSmall ? 11 : 13} color={c.color} />
      <Text style={[styles.text, { color: c.color }, isSmall && styles.smText]}>
        {STATUS_LABELS[status].toUpperCase()}
      </Text>
    </Animated.View>
  );
};

export const StatusBadge = React.memo(StatusBadgeComponent);

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 0, // Unified Sharp Edges
    borderLeftWidth: 3,
  },
  sm: { paddingHorizontal: 6, paddingVertical: 3, borderLeftWidth: 2 },
  text: {
    fontSize: 10,
    fontFamily: typography.fontFamily.black,
    letterSpacing: 1,
  },
  smText: { fontSize: 8, letterSpacing: 0.5 },
});
