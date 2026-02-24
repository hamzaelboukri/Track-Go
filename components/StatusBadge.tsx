import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { ParcelStatusType } from "../shared/schema";
import { STATUS_LABELS } from "@/constants/labels";

interface StatusBadgeProps {
  status: ParcelStatusType;
  size?: "small" | "medium";
}

export function StatusBadge({ status, size = "small" }: StatusBadgeProps) {
  const { colors } = useAppTheme();

  const statusConfig: Record<ParcelStatusType, { color: string; icon: keyof typeof Ionicons.glyphMap }> = {
    pending: { color: colors.statusPending, icon: "time-outline" },
    in_progress: { color: colors.statusInProgress, icon: "navigate-outline" },
    delivered: { color: colors.statusDelivered, icon: "checkmark-circle" },
    failed: { color: colors.statusFailed, icon: "alert-circle" },
  };

  const config = statusConfig[status];
  const isSmall = size === "small";

  return (
    <View style={[styles.badge, { backgroundColor: config.color + "18" }, isSmall && styles.badgeSmall]}>
      <Ionicons name={config.icon} size={isSmall ? 12 : 14} color={config.color} />
      <Text style={[styles.text, { color: config.color }, isSmall && styles.textSmall]}>
        {STATUS_LABELS[status]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  text: {
    fontSize: 12,
    fontWeight: "600",
  },
  textSmall: {
    fontSize: 11,
  },
});
