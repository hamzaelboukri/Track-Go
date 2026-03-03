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
  FadeInDown,
  FadeOutUp,
} from "react-native-reanimated";
import { useAppTheme } from "@/hooks/useAppTheme";

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
  const { colors } = useAppTheme();
  const pulseScale = useSharedValue(1);
  const syncRotation = useSharedValue(0);

  useEffect(() => {
    if (isRefreshing) {
      syncRotation.value = withRepeat(
        withTiming(360, { duration: 1000 }),
        -1,
        false
      );
    } else {
      syncRotation.value = withTiming(0, { duration: 300 });
    }
  }, [isRefreshing, syncRotation]);

  useEffect(() => {
    if (!isOffline && !isRefreshing) {
      pulseScale.value = withSequence(
        withSpring(1.2, { damping: 2, stiffness: 100 }),
        withSpring(1, { damping: 2, stiffness: 100 })
      );
    }
  }, [isOffline, isRefreshing, pulseScale]);

  const syncAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${syncRotation.value}deg` }],
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const getStatusConfig = () => {
    if (isRefreshing) {
      return {
        icon: "sync" as const,
        color: colors.primary,
        bgColor: colors.primary + "15",
        text: "Synchronisation...",
      };
    }
    if (isOffline) {
      return {
        icon: "cloud-offline" as const,
        color: colors.statusPending,
        bgColor: colors.statusPending + "15",
        text: "Mode hors-ligne",
      };
    }
    return {
      icon: "cloud-done" as const,
      color: colors.success,
      bgColor: colors.success + "15",
      text: "En ligne",
    };
  };

  const config = getStatusConfig();
  const formattedTime = lastUpdate
    ? new Date(lastUpdate).toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <Animated.View
      entering={FadeInDown.springify()}
      exiting={FadeOutUp.springify()}
      style={[styles.container, { backgroundColor: config.bgColor }]}
    >
      <Animated.View
        style={[
          styles.iconContainer,
          isRefreshing ? syncAnimatedStyle : pulseAnimatedStyle,
        ]}
      >
        <Ionicons name={config.icon} size={14} color={config.color} />
      </Animated.View>
      <View style={styles.textContainer}>
        <Text style={[styles.statusText, { color: config.color }]}>
          {config.text}
        </Text>
        {formattedTime && !isRefreshing && (
          <Text style={[styles.timeText, { color: colors.textTertiary }]}>
            · Mis à jour à {formattedTime}
          </Text>
        )}
      </View>
    </Animated.View>
  );
}

export const RealtimeStatusIndicator = React.memo(RealtimeStatusIndicatorBase);

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
    marginHorizontal: 16,
  },
  iconContainer: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  textContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  timeText: {
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
});
