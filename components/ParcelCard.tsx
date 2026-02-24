import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { StatusBadge } from "./StatusBadge";
import { PriorityBadge } from "./PriorityBadge";
import type { Parcel } from "../shared/schema";

interface ParcelCardProps {
  parcel: Parcel;
  onPress: () => void;
}

export function ParcelCard({ parcel, onPress }: ParcelCardProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.borderLight,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
    >
      <View style={styles.header}>
        <View style={styles.orderBadge}>
          <Text style={[styles.orderText, { color: colors.primary }]}>#{parcel.order}</Text>
        </View>
        <View style={styles.badges}>
          <PriorityBadge priority={parcel.priority} />
          <StatusBadge status={parcel.status} />
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.recipientRow}>
          <Ionicons name="person-outline" size={16} color={colors.textSecondary} />
          <Text style={[styles.recipientName, { color: colors.text }]} numberOfLines={1}>
            {parcel.recipient.name}
          </Text>
        </View>

        <View style={styles.addressRow}>
          <Ionicons name="location-outline" size={16} color={colors.textTertiary} />
          <Text style={[styles.addressText, { color: colors.textSecondary }]} numberOfLines={2}>
            {parcel.address.street}, {parcel.address.postalCode} {parcel.address.city}
          </Text>
        </View>
      </View>

      <View style={[styles.footer, { borderTopColor: colors.borderLight }]}>
        <View style={styles.footerItem}>
          <Ionicons name="barcode-outline" size={14} color={colors.textTertiary} />
          <Text style={[styles.footerText, { color: colors.textTertiary }]}>{parcel.trackingCode}</Text>
        </View>
        <View style={styles.footerItem}>
          <Ionicons name="scale-outline" size={14} color={colors.textTertiary} />
          <Text style={[styles.footerText, { color: colors.textTertiary }]}>{parcel.weight} kg</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    borderWidth: 1,
    marginHorizontal: 16,
    marginVertical: 5,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
  },
  orderBadge: {
    width: 32,
    height: 32,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  orderText: {
    fontSize: 14,
    fontWeight: "800",
  },
  badges: {
    flexDirection: "row",
    gap: 6,
  },
  body: {
    paddingHorizontal: 14,
    gap: 6,
  },
  recipientRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  recipientName: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  addressRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
  },
  addressText: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 8,
    borderTopWidth: 1,
    gap: 12,
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  footerText: {
    fontSize: 11,
    fontWeight: "500",
  },
});
