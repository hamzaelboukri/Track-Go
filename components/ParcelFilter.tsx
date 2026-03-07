import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";
import { typography } from "@/constants/typography";

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

const filters: { key: FilterType; label: string }[] = [
  { key: "all", label: "TOUT" },
  { key: "delivered", label: "LIVRÉS" },
  { key: "pending", label: "ATTENTE" },
  { key: "failed", label: "ÉCHECS" },
];

export function ParcelFilter({ activeFilter, onFilterChange, counts }: ParcelFilterProps) {
  const { colors, isDark } = useAppTheme();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {filters.map((f) => {
        const isActive = activeFilter === f.key;
        const count = counts?.[f.key];

        return (
          <Pressable
            key={f.key}
            onPress={() => onFilterChange(f.key)}
            style={[
              styles.tab,
              {
                borderBottomColor: isActive ? colors.accent : "transparent",
                backgroundColor: isActive ? (isDark ? "#121212" : "#F9F9F9") : "transparent",
              },
            ]}
          >
            <View style={styles.tabContent}>
              <Text
                style={[
                  styles.tabLabel,
                  { color: isActive ? colors.text : colors.textTertiary },
                ]}
              >
                {f.label}
              </Text>
              {count !== undefined && (
                <View style={[styles.countBadge, { backgroundColor: isActive ? colors.text : (isDark ? "#222" : "#EEE") }]}>
                  <Text
                    style={[
                      styles.countText,
                      { color: isActive ? colors.background : colors.textSecondary },
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              )}
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    gap: 0,
    paddingVertical: 0,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 3,
  },
  tabContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  tabLabel: {
    fontSize: 10,
    fontFamily: typography.fontFamily.black,
    letterSpacing: 1.5,
  },
  countBadge: {
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  countText: {
    fontSize: 9,
    fontFamily: typography.fontFamily.black,
  },
});
