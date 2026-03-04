import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { typography } from "@/constants/typography";

interface PriorityBadgeProps {
  priority: "normal" | "express" | "urgent";
}

const PriorityBadgeComponent = ({ priority }: PriorityBadgeProps) => {
  const { colors, isDark } = useAppTheme();

  const cfg = {
    normal: { color: colors.textTertiary, icon: "remove" as const, label: "NORMAL" },
    express: { color: colors.accentWarm, icon: "flash" as const, label: "EXPRESS" },
    urgent: { color: colors.danger, icon: "flame" as const, label: "URGENT" },
  };

  const c = cfg[priority];

  return (
    <View style={[styles.badge, { backgroundColor: isDark ? "#141414" : "#F6F6F6", borderColor: c.color }]}>
      <Ionicons name={c.icon} size={9} color={c.color} />
      <Text style={[styles.txt, { color: c.color }]}>{c.label}</Text>
    </View>
  );
};

export const PriorityBadge = React.memo(PriorityBadgeComponent);

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderRadius: 0,
  },
  txt: {
    fontSize: 8,
    fontFamily: typography.fontFamily.black,
    letterSpacing: 1.5,
  },
});
