import React from "react";
import { View, Text, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useAppTheme } from "@/hooks/useAppTheme";
import { typography } from "@/constants/typography";
import type { TourStats } from "../shared/schema";

interface StatsBarProps {
  stats: TourStats;
}

function StatsBarComponent({ stats }: StatsBarProps) {
  const { colors, isDark } = useAppTheme();

  return (
    <View style={[
      styles.container,
      {
        backgroundColor: colors.surface,
        // Airbnb-inspired shadow instead of border
        ...(Platform.OS !== "android" ? {
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 1,
          shadowRadius: 12,
        } : { elevation: 3 }),
      },
    ]}>
      {/* FedEx-inspired progress bar */}
      <View style={styles.progressSection}>
        <View style={styles.progressRow}>
          <Text style={[styles.progressLabel, { color: colors.textSecondary }]}>
            Progression
          </Text>
          <View style={styles.progressValueRow}>
            <Text style={[styles.progressPercent, { color: colors.accent }]}>
              {stats.progressPercent}%
            </Text>
          </View>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: isDark ? colors.surfaceSecondary : "#E2E8F0" }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${stats.progressPercent}%`,
                backgroundColor: colors.accent,
              },
            ]}
          />
        </View>
      </View>

      {/* DoorDash-inspired stat items */}
      <View style={styles.statsRow}>
        <StatItem
          icon="logo"
          label="Total"
          value={stats.total}
          color={isDark ? colors.text : colors.primary}
          bgColor={isDark ? colors.surfaceSecondary : "#F1F5F9"}
        />
        <StatItem
          icon="checkmark-circle"
          label="Livrés"
          value={stats.delivered}
          color={colors.statusDelivered}
          bgColor={colors.statusDelivered + "14"}
        />
        <StatItem
          icon="time-outline"
          label="Restants"
          value={stats.pending + stats.inProgress}
          color={colors.statusPending}
          bgColor={colors.statusPending + "14"}
        />
        <StatItem
          icon="alert-circle"
          label="Échecs"
          value={stats.failed}
          color={colors.statusFailed}
          bgColor={colors.statusFailed + "14"}
        />
      </View>
    </View>
  );
}

export const StatsBar = React.memo(StatsBarComponent, (prev, next) => {
  const a = prev.stats;
  const b = next.stats;
  return (
    a.total === b.total &&
    a.delivered === b.delivered &&
    a.failed === b.failed &&
    a.pending === b.pending &&
    a.inProgress === b.inProgress &&
    a.progressPercent === b.progressPercent
  );
});

function StatItem({ icon, label, value, color, bgColor }: {
  icon: keyof typeof Ionicons.glyphMap | "logo";
  label: string;
  value: number;
  color: string;
  bgColor: string;
}) {
  const { colors } = useAppTheme();
  return (
    <View style={[styles.statItem, { backgroundColor: bgColor }]}>
      {icon === "logo" ? (
        <Image
          source={require("@/assets/images/icon.png")}
          style={[styles.logoIcon, { tintColor: color }]}
          contentFit="contain"
        />
      ) : (
        <Ionicons name={icon} size={16} color={color} />
      )}
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color: colors.textTertiary }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 16,
    gap: 14,
    // No border — Airbnb-style shadow elevation only
  },
  progressSection: {
    gap: 10,
  },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressLabel: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.semibold,
  },
  progressValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  progressPercent: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.extrabold,
    letterSpacing: typography.letterSpacing.tight,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 8,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 14,
    gap: 3,
  },
  logoIcon: {
    width: 16,
    height: 16,
  },
  statValue: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.extrabold,
  },
  statLabel: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
  },
});
