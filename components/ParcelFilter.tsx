import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";

export type FilterType = "all" | "delivered" | "pending" | "failed";

interface ParcelFilterProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  counts?: {
    all: number;
    delivered: number;
    pending: number;
    failed: number;
  };
}

export function ParcelFilter({ activeFilter, onFilterChange, counts }: ParcelFilterProps) {
  const { colors } = useAppTheme();

  const filters: { key: FilterType; label: string }[] = [
    { key: "all", label: "Tous" },
    { key: "delivered", label: "Livrés" },
    { key: "pending", label: "En attente" },
    { key: "failed", label: "Incidents" },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {filters.map((filter) => {
        const isActive = activeFilter === filter.key;
        const count = counts?.[filter.key];

        return (
          <Pressable
            key={filter.key}
            onPress={() => onFilterChange(filter.key)}
            style={({ pressed }) => [
              styles.filterButton,
              {
                backgroundColor: isActive ? colors.primary : colors.surface,
                borderColor: isActive ? colors.primary : colors.borderLight,
                transform: [{ scale: pressed ? 0.96 : 1 }],
              },
            ]}
          >
            <Text
              style={[
                styles.filterText,
                { color: isActive ? "#FFFFFF" : colors.text },
              ]}
            >
              {filter.label}
            </Text>
            {count !== undefined && (
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor: isActive
                      ? "rgba(255, 255, 255, 0.25)"
                      : colors.background,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: isActive ? "#FFFFFF" : colors.textSecondary },
                  ]}
                >
                  {count}
                </Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 10,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: "700",
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
  },
});
