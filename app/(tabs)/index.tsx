import React, { useCallback } from "react";
import { View, Text, FlatList, StyleSheet, RefreshControl, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useTournee } from "@/contexts/TourneeContext";
import { useAuth } from "@/contexts/AuthContext";
import { ParcelCard } from "@/components/ParcelCard";
import { StatsBar } from "@/components/StatsBar";
import { LoadingScreen } from "@/components/LoadingScreen";
import type { Parcel } from "../../shared/schema";

export default function TourneeScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { driver } = useAuth();
  const { tour, stats, isLoading, isRefreshing, refetch } = useTournee();

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  const handleParcelPress = useCallback((parcel: Parcel) => {
    router.push({ pathname: "/parcel/[id]", params: { id: parcel.id } });
  }, []);

  const renderParcel = useCallback(
    ({ item }: { item: Parcel }) => (
      <ParcelCard parcel={item} onPress={() => handleParcelPress(item)} />
    ),
    [handleParcelPress]
  );

  const keyExtractor = useCallback((item: Parcel) => item.id, []);

  if (isLoading) {
    return <LoadingScreen message="Chargement de la tournee..." />;
  }

  const today = new Date();
  const dateStr = today.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={tour?.parcels || []}
        renderItem={renderParcel}
        keyExtractor={keyExtractor}
        contentContainerStyle={{
          paddingTop: insets.top + webTopInset + 8,
          paddingBottom: 100,
        }}
        ListHeaderComponent={
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <View>
                <Text style={[styles.greeting, { color: colors.textSecondary }]}>
                  Bonjour, {driver?.firstName}
                </Text>
                <Text style={[styles.dateText, { color: colors.text }]}>
                  {dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}
                </Text>
              </View>
              <View style={[styles.vehicleBadge, { backgroundColor: colors.primary + "15" }]}>
                <Ionicons name="car-outline" size={16} color={colors.primary} />
                <Text style={[styles.vehicleText, { color: colors.primary }]}>
                  {driver?.vehicleId}
                </Text>
              </View>
            </View>
            {stats && <StatsBar stats={stats} />}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Colis du jour
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="cube-outline" size={48} color={colors.textTertiary} />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Aucun colis pour aujourd'hui
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refetch} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
        getItemLayout={(_, index) => ({ length: 160, offset: 160 * index, index })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    gap: 16,
    paddingBottom: 8,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  greeting: {
    fontSize: 14,
    fontWeight: "500",
  },
  dateText: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  vehicleBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  vehicleText: {
    fontSize: 13,
    fontWeight: "700",
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    paddingHorizontal: 16,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "500",
  },
});
