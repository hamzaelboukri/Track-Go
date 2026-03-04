import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  FadeIn,
  FadeOut,
} from "react-native-reanimated";
import { useAppTheme } from "@/hooks/useAppTheme";
import { typography } from "@/constants/typography";

export interface RealtimeStatusIndicatorProps {
  isOffline: boolean;
  isRefreshing: boolean;
  lastUpdate: Date | null;
}

export function RealtimeStatusIndicatorBase({
  isOffline,
  isRefreshing,
  lastUpdate,
}: RealtimeStatusIndicatorProps) {
  const { colors, isDark } = useAppTheme();
  const pulse = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    if (isRefreshing) {
      rotation.value = withRepeat(withTiming(360, { duration: 1000 }), -1, false);
    } else {
      rotation.value = withTiming(0, { duration: 300 });
    }
  }, [isRefreshing, rotation]);

  useEffect(() => {
    if (!isOffline && !isRefreshing) {
      pulse.value = withSequence(
        withSpring(1.3, { damping: 4 }),
        withSpring(1, { damping: 4 })
      );
    }
  }, [isOffline, isRefreshing, pulse]);

  const rotStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const getCfg = () => {
    if (isRefreshing) return { icon: "sync" as const, color: colors.info, text: "Sync..." };
    if (isOffline) return { icon: "cloud-offline" as const, color: colors.warning, text: "Hors-ligne" };
    return { icon: "wifi" as const, color: colors.success, text: "En ligne" };
  };

  const cfg = getCfg();
  const time = lastUpdate ? new Date(lastUpdate).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : null;

  return (
    <Animated.View
      entering={FadeIn}
      exiting={FadeOut}
      style={[styles.container, { backgroundColor: isDark ? "#141414" : "#F6F6F6" }]}
    >
      <Animated.View style={isRefreshing ? rotStyle : pulseStyle}>
        <View style={[styles.dot, { backgroundColor: cfg.color }]} />
      </Animated.View>
      <Text style={[styles.text, { color: cfg.color }]}>{cfg.text}</Text>
      {time && !isRefreshing && (
        <Text style={[styles.time, { color: colors.textTertiary }]}>· {time}</Text>
      )}
    </Animated.View>
  );
}

export const RealtimeStatusIndicator = React.memo(RealtimeStatusIndicatorBase);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 20,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  text: {
    fontSize: typography.size.sm,
    fontWeight: typography.weight.bold,
  },
  time: {
    fontSize: typography.size.xs,
    fontWeight: typography.weight.medium,
  },
});
