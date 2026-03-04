import React from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";
import { typography } from "@/constants/typography";

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = "Chargement..." }: LoadingScreenProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ActivityIndicator size="large" color={colors.text} />
      <Text style={[styles.text, { color: colors.textSecondary }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  text: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.medium,
  },
});
