import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";

interface PriorityBadgeProps {
  priority: "normal" | "express" | "urgent";
}

const PriorityBadgeComponent = ({ priority }: PriorityBadgeProps) => {
  const { colors } = useAppTheme();

  const config = {
    normal: { color: colors.textTertiary, icon: "remove-outline" as const, label: "Normal" },
    express: { color: colors.accent, icon: "flash-outline" as const, label: "Express" },
    urgent: { color: colors.danger, icon: "flame-outline" as const, label: "Urgent" },
  };

  const c = config[priority];

  return (
    <View style={[styles.badge, { backgroundColor: c.color + "15" }]}>
      <Ionicons name={c.icon} size={12} color={c.color} />
      <Text style={[styles.text, { color: c.color }]}>{c.label}</Text>
    </View>
  );
};

// Memoize to prevent re-renders when priority hasn't changed
export const PriorityBadge = React.memo(PriorityBadgeComponent);

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  text: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
});
