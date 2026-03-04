import React, { useState } from "react";
import { View, Text, StyleSheet, Platform, Pressable, ScrollView, RefreshControl, TextInput, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useTournee } from "@/contexts/TourneeContext";
import { LoadingScreen } from "@/components/LoadingScreen";
import { StatusBadge } from "@/components/StatusBadge";
import { typography } from "@/constants/typography";
import type { Parcel } from "../../shared/schema";

let MapView: any = null;
let Marker: any = null;
try {
  const maps = require("react-native-maps");
  MapView = maps.default;
  Marker = maps.Marker;
} catch { }

export default function MapScreen() {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { tour, isLoading, isRefreshing, refetch, stats } = useTournee();
  const [searchQuery, setSearchQuery] = useState("");
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  if (isLoading && !tour) return <LoadingScreen message="HARMONISATION CARTOGRAPHIQUE..." />;

  const parcels = tour?.parcels || [];
  const filteredParcels = parcels.filter(p =>
    p.recipient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.address.street.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.order.toString().includes(searchQuery)
  );

  const pendingParcels = parcels.filter((p) => p.status === "pending" || p.status === "in_progress");

  const renderSectionHeader = (num: string, title: string) => (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionNum, { color: colors.accent }]}>{num}</Text>
      <Text style={[styles.sectionTitleText, { color: colors.textTertiary }]}>{title.toUpperCase()}</Text>
      <View style={[styles.sectionLine, { backgroundColor: colors.border }]} />
    </View>
  );

  const renderHeader = () => (
    <View style={styles.terminalHeader}>
      <Text style={[styles.megaTitle, { color: colors.text }]}>INTERFACE CARTE</Text>
      <View style={[styles.statsBracket, { borderColor: colors.border }]}>
        <Text style={[styles.statsText, { color: colors.textSecondary }]}>
          {pendingParcels.length} POINTS DE LIVRAISON ACTIFS
        </Text>
      </View>
    </View>
  );

  if (!MapView || Platform.OS === "web") {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />

        {/* BACKGROUND DECORATION */}
        <View style={styles.backgroundDecoration}>
          {Array.from({ length: 10 }).map((_, i) => (
            <View key={i} style={[styles.bgLine, { left: `${(i + 1) * 10}%`, backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }]} />
          ))}
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: insets.top + webTopInset + 20,
            paddingBottom: 150,
            paddingHorizontal: 24
          }}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={refetch} tintColor={colors.text} />
          }
        >
          {renderHeader()}

          <View style={styles.section}>
            {renderSectionHeader("01", "Recherche Tactique")}
            <View style={[styles.searchContainer, { backgroundColor: isDark ? "#0A0A0A" : "#F6F6F6", borderColor: colors.border }]}>
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="IDENTIFIER_UN_POINT"
                placeholderTextColor={colors.textTertiary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              <Ionicons name="search-outline" size={20} color={colors.textTertiary} />
            </View>
          </View>

          <View style={styles.section}>
            {renderSectionHeader("02", "Manifeste Géographique")}
            <View style={styles.listContainer}>
              {filteredParcels.map((parcel) => (
                <Pressable
                  key={parcel.id}
                  onPress={() => router.push({ pathname: "/parcel/[id]", params: { id: parcel.id } })}
                  style={({ pressed }) => [
                    styles.listItem,
                    { borderBottomColor: colors.border, opacity: pressed ? 0.8 : 1 },
                  ]}
                >
                  <View style={styles.itemMain}>
                    <Text style={[styles.itemOrder, { color: colors.textTertiary }]}>#{parcel.order}</Text>
                    <Text style={[styles.itemRecipient, { color: colors.text }]} numberOfLines={1}>{parcel.recipient.name.toUpperCase()}</Text>
                    <Text style={[styles.itemAddress, { color: colors.textSecondary }]} numberOfLines={1}>{parcel.address.street.toUpperCase()}</Text>
                  </View>
                  <View style={styles.itemStatus}>
                    <StatusBadge status={parcel.status} size="small" />
                    <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
                  </View>
                </Pressable>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  const initialRegion = parcels.length > 0
    ? {
      latitude: parcels[0].address.coordinates.latitude,
      longitude: parcels[0].address.coordinates.longitude,
      latitudeDelta: 0.1,
      longitudeDelta: 0.1,
    }
    : { latitude: 48.8566, longitude: 2.3522, latitudeDelta: 0.1, longitudeDelta: 0.1 };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton
        userInterfaceStyle={isDark ? "dark" : "light"}
        provider="google"
      >
        {parcels.map((parcel) => (
          <Marker
            key={parcel.id}
            coordinate={parcel.address.coordinates}
            onCalloutPress={() =>
              router.push({ pathname: "/parcel/[id]", params: { id: parcel.id } })
            }
          >
            <View style={[styles.customMarker, { backgroundColor: isDark ? "#000" : "#FFF", borderColor: getMarkerColor(parcel, colors) }]}>
              <Text style={[styles.markerText, { color: colors.text }]}>{parcel.order}</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      <View style={[styles.overlay, { paddingTop: insets.top + (Platform.select({ web: 64, default: 10 })) }]}>
        <View style={[styles.floatingCard, { backgroundColor: isDark ? "rgba(10,10,10,0.95)" : "rgba(255,255,255,0.95)", borderColor: colors.border }]}>
          <View style={styles.floatingHeader}>
            <View style={[styles.liveIndicatorRow, { marginBottom: 0 }]}>
              <View style={[styles.pulsingLight, { backgroundColor: colors.success }]} />
              <Text style={[styles.liveTag, { color: colors.success }]}>CARTOGRAPHY_LIVE</Text>
            </View>
            <Text style={[styles.floatingTitle, { color: colors.text }]}>INTERFACE TACTIQUE</Text>
          </View>
          <View style={[styles.floatingSearch, { backgroundColor: isDark ? "#1A1A1A" : "#F6F6F6", borderColor: colors.border, borderWidth: 1 }]}>
            <TextInput
              style={[styles.floatingInput, { color: colors.text }]}
              placeholder="RECHERCHE_RAPIDE..."
              placeholderTextColor={colors.textTertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            <Ionicons name="search" size={16} color={colors.textTertiary} />
          </View>
        </View>
      </View>
    </View>
  );
}

function getMarkerColor(parcel: Parcel, colors: any): string {
  switch (parcel.status) {
    case "delivered": return colors.success;
    case "failed": return colors.danger;
    case "in_progress": return colors.accent;
    default: return colors.textTertiary;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundDecoration: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
  bgLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
  },
  terminalHeader: {
    marginBottom: 40,
  },
  headerTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  liveIndicatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },
  pulsingLight: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveTag: {
    fontSize: 9,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 1.5,
  },
  terminalId: {
    fontSize: 9,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 2,
  },
  megaTitle: {
    fontSize: 32,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: -1.5,
  },
  statsBracket: {
    borderLeftWidth: 3,
    paddingLeft: 10,
    marginTop: 8,
  },
  statsText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 1,
  },
  section: {
    marginBottom: 32,
    gap: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionNum: {
    fontSize: 10,
    fontFamily: typography.fontFamily.bold,
  },
  sectionTitleText: {
    fontSize: 9,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 2,
  },
  sectionLine: {
    flex: 1,
    height: 1,
  },
  searchContainer: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 1,
  },
  listContainer: {
    gap: 0,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    justifyContent: "space-between",
  },
  itemMain: { flex: 1, gap: 4 },
  itemOrder: { fontSize: 10, fontFamily: typography.fontFamily.bold, letterSpacing: 1 },
  itemRecipient: { fontSize: 16, fontFamily: typography.fontFamily.bold, letterSpacing: -0.5 },
  itemAddress: { fontSize: 12, fontFamily: typography.fontFamily.medium, letterSpacing: 0.5 },
  itemStatus: { flexDirection: "row", alignItems: "center", gap: 16 },

  overlay: {
    position: "absolute",
    left: 20,
    right: 20,
    zIndex: 100,
  },
  floatingCard: {
    padding: 24,
    gap: 20,
    borderWidth: 1,
  },
  floatingHeader: {
    gap: 8,
  },
  floatingTitle: {
    fontSize: 18,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: -1,
  },
  floatingSearch: {
    height: 54,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 12,
  },
  floatingInput: {
    flex: 1,
    fontSize: 12,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 1,
  },
  customMarker: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 2,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.bold,
  }
});
