import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { TourStats } from "../shared/schema";

interface StatsBarProps {
  stats: TourStats;
}

export function StatsBar({ stats }: StatsBarProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
      <View style={styles.progressRow}>
        <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>Progression</Text>
        <Text style={[styles.progressPercent, { color: colors.primary }]}>{stats.progressPercent}%</Text>
      </View>
      <View style={[styles.progressTrack, { backgroundColor: colors.surfaceSecondary }]}>
        <View
          style={[
            styles.progressFill,
            { width: `${stats.progressPercent}%`, backgroundColor: colors.success },
          ]}
        />
      </View>
      <View style={styles.statsRow}>
        <StatItem icon="cube-outline" label="Total" value={stats.total} color={colors.text} bgColor={colors.surfaceSecondary} />
        <StatItem icon="checkmark-circle" label="Livres" value={stats.delivered} color={colors.success} bgColor={colors.success + "15"} />
        <StatItem icon="time-outline" label="Restants" value={stats.pending + stats.inProgress} color={colors.statusPending} bgColor={colors.statusPending + "15"} />
        <StatItem icon="alert-circle" label="Echecs" value={stats.failed} color={colors.danger} bgColor={colors.danger + "15"} />
      </View>
    </View>
  );
}

function StatItem({ icon, label, value, color, bgColor }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: number;
  color: string;
  bgColor: string;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.statItem, { backgroundColor: bgColor }]}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textTertiary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 10,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: {
    fontSize: 13,
    fontWeight: "500",
  },
  progressPercent: {
    fontSize: 18,
    fontWeight: "800",
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 10,
    gap: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "500",
  },
});
