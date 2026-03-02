import React, { useCallback, useState, useMemo } from "react";
import { View, Text, FlatList, StyleSheet, RefreshControl, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Image } from "expo-image";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useTournee } from "@/contexts/TourneeContext";

import { ParcelCard } from "@/components/ParcelCard";
import { StatsBar } from "@/components/StatsBar";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ParcelFilter, type FilterType } from "@/components/ParcelFilter";
import { RealtimeStatusIndicator } from "@/components/RealtimeStatusIndicator";
import type { Parcel } from "../../shared/schema";

export default function TourneeScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();

  const { tour, stats, isLoading, isRefreshing, isOffline, lastUpdate, refetch } = useTournee();

  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  // Filtrer les colis selon le filtre actif
  const filteredParcels = useMemo(() => {
    const parcels = tour?.parcels || [];
    
    switch (activeFilter) {
      case "delivered":
        return parcels.filter((p) => p.status === "delivered");
      case "pending":
        return parcels.filter((p) => p.status === "pending");
      case "failed":
        return parcels.filter((p) => p.status === "failed");
      case "all":
      default:
        return parcels;
    }
  }, [tour?.parcels, activeFilter]);

  // Calculer les compteurs pour chaque filtre
  const filterCounts = useMemo(() => {
    const parcels = tour?.parcels || [];
    return {
      all: parcels.length,
      delivered: parcels.filter((p) => p.status === "delivered").length,
      pending: parcels.filter((p) => p.status === "pending").length,
      failed: parcels.filter((p) => p.status === "failed").length,
    };
  }, [tour?.parcels]);

  const handleParcelPress = useCallback((parcel: Parcel) => {
    router.push({ pathname: "/parcel/[id]", params: { id: parcel.id } });
  }, []);

  const renderParcel = useCallback(
    ({ item }: { item: Parcel }) => (
      <ParcelCard parcel={item} onPress={() => handleParcelPress(item)} />
    ),
    [handleParcelPress]
  );

  // Optimize FlatList header rendering
  const ListHeader = useMemo(
    () => (
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.greeting, { color: colors.textSecondary }]}>
              Bonjour
            </Text>
            <Text style={[styles.dateText, { color: colors.text }]}>
              {new Date().toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              }).replace(/^\w/, (c) => c.toUpperCase())}
            </Text>
          </View>
        </View>
        {stats && <StatsBar stats={stats} />}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Colis du jour
        </Text>
        <ParcelFilter
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          counts={filterCounts}
        />
      </View>
    ),
    [colors, stats, activeFilter, filterCounts]
  );

  // Optimize empty component
  const ListEmpty = useMemo(
    () => (
      <View style={styles.empty}>
        <Image
          source={require("@/assets/images/icon.png")}
          style={styles.emptyImage}
          contentFit="contain"
        />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          Aucun colis pour aujourd&apos;hui
        </Text>
      </View>
    ),
    [colors.textSecondary]
  );

  const keyExtractor = useCallback((item: Parcel) => item.id, []);

  if (isLoading) {
    return <LoadingScreen message="Chargement de la tournee..." />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={filteredParcels}
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
                  Bonjour
                </Text>
                <Text style={[styles.dateText, { color: colors.text }]}>
                  {dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}
                </Text>
              </View>

            </View>
            <RealtimeStatusIndicator
              isOffline={isOffline}
              isRefreshing={isRefreshing}
              lastUpdate={lastUpdate}
            />
            {stats && <StatsBar stats={stats} />}
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Colis du jour
            </Text>
            <ParcelFilter
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              counts={filterCounts}
            />
          </View>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.emptyImage}
              contentFit="contain"
            />
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Aucun colis pour aujourd&apos;hui
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refetch} tintColor={colors.primary} />
        }
        showsVerticalScrollIndicator={false}
        getItemLayout={(_, index) => ({ length: 160, offset: 160 * index, index })}
        // Performance optimizations
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        updateCellsBatchingPeriod={50}
        initialNumToRender={10}
        windowSize={10}
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
  emptyImage: {
    width: 80,
    height: 80,
    opacity: 0.3,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: "500",
  },
});
