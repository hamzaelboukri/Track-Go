import React from "react";
import { View, Text, StyleSheet, Pressable, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { typography } from "@/constants/typography";
import { StatusBadge } from "./StatusBadge";
import type { Parcel } from "../shared/schema";

interface ParcelCardProps {
  parcel: Parcel;
  onPress: () => void;
}

const ParcelCardComponent = ({ parcel, onPress }: ParcelCardProps) => {
  const { colors, isDark } = useAppTheme();

  const getPriorityColor = () => {
    if (parcel.priority === 'urgent') return colors.danger;
    if (parcel.priority === 'express') return colors.accentWarm;
    return colors.textTertiary;
  };

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: isDark ? colors.border : "#E2E2E2",
          opacity: pressed ? 0.8 : 1,
        },
      ]}
    >
      {/* ─── CREATIVE INDUSTRIAL INDEX ─── */}
      <View style={[styles.indexCol, { backgroundColor: isDark ? "#000" : "#F6F6F6" }]}>
        <Text style={[styles.indexNumber, { color: colors.text }]}>{parcel.order}</Text>
        <View style={[styles.indexLine, { backgroundColor: colors.border }]} />
        <View style={[styles.dotMarker, { backgroundColor: getPriorityColor() }]} />
      </View>

      <View style={styles.contentCol}>
        {/* Top Meta Row */}
        <View style={styles.topRow}>
          <Text style={[styles.trackingLabel, { color: colors.textTertiary }]}>#{parcel.trackingCode}</Text>
          <StatusBadge status={parcel.status} size="small" />
        </View>

        {/* Recipient & Address Section */}
        <View style={styles.infoGroup}>
          <Text style={[styles.recipientName, { color: colors.text }]}>{parcel.recipient.name.toUpperCase()}</Text>
          <View style={styles.addressRow}>
            <Ionicons name="location-outline" size={14} color={colors.accent} />
            <Text style={[styles.addressText, { color: colors.textSecondary }]} numberOfLines={1}>
              {parcel.address.street}
            </Text>
          </View>
        </View>

        {/* Technical Footer Row */}
        <View style={[styles.bottomRow, { borderTopColor: isDark ? colors.border : "#F6F6F6" }]}>
          <View style={styles.techMetrics}>
            <View style={[styles.metricBox, { backgroundColor: isDark ? "#141414" : "#EEE" }]}>
              <Text style={[styles.metricValue, { color: colors.text }]}>{parcel.weight} KG</Text>
            </View>
            <View style={[styles.metricBox, { backgroundColor: isDark ? "#141414" : "#EEE" }]}>
              <Text style={[styles.metricValue, { color: colors.text }]}>{parcel.priority.toUpperCase()}</Text>
            </View>
          </View>
          <View style={[styles.goButton, { backgroundColor: isDark ? colors.text : "#000" }]}>
            <Ionicons name="chevron-forward" size={16} color={isDark ? "#000" : "#FFF"} />
          </View>
        </View>
      </View>

      {/* Industrial Corner Decoration */}
      <View style={[styles.cornerMarker, { borderTopColor: colors.border, borderRightColor: colors.border }]} />
    </Pressable>
  );
};

export const ParcelCard = React.memo(ParcelCardComponent);

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginVertical: 8,
    flexDirection: "row",
    borderWidth: 1,
    borderRadius: 0,
    overflow: "hidden",
    minHeight: 140,
  },
  indexCol: {
    width: 60,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  indexNumber: {
    fontSize: 24,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: -1,
  },
  indexLine: {
    width: 20,
    height: 1,
  },
  dotMarker: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  contentCol: {
    flex: 1,
    padding: 16,
    gap: 8,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  trackingLabel: {
    fontSize: 9,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 1.5,
  },
  infoGroup: {
    flex: 1,
    gap: 4,
  },
  recipientName: {
    fontSize: 16,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 0.5,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  addressText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 0.2,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
  },
  techMetrics: {
    flexDirection: "row",
    gap: 8,
  },
  metricBox: {
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  metricValue: {
    fontSize: 9,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 1,
  },
  goButton: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  cornerMarker: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 10,
    height: 10,
    borderTopWidth: 1,
    borderRightWidth: 1,
  }
});
