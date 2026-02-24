import React from "react";
import { View, Text, StyleSheet, Platform, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useTournee } from "@/contexts/TourneeContext";
import { LoadingScreen } from "@/components/LoadingScreen";
import { StatusBadge } from "@/components/StatusBadge";
import type { Parcel } from "../../shared/schema";

let MapView: any = null;
let Marker: any = null;
try {
  const maps = require("react-native-maps");
  MapView = maps.default;
  Marker = maps.Marker;
} catch {}

export default function MapScreen() {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { tour, isLoading } = useTournee();
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  if (isLoading) return <LoadingScreen message="Chargement de la carte..." />;

  const parcels = tour?.parcels || [];
  const pendingParcels = parcels.filter((p) => p.status === "pending" || p.status === "in_progress");

  if (!MapView || Platform.OS === "web") {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + webTopInset }]}>
        <View style={styles.headerBar}>
          <Text style={[styles.title, { color: colors.text }]}>Carte des livraisons</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {pendingParcels.length} point(s) restant(s)
          </Text>
        </View>
        <View style={styles.listFallback}>
          {parcels.map((parcel) => (
            <Pressable
              key={parcel.id}
              onPress={() => router.push({ pathname: "/parcel/[id]", params: { id: parcel.id } })}
              style={[styles.mapItem, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
            >
              <View style={[styles.markerDot, { backgroundColor: getMarkerColor(parcel, colors) }]} />
              <View style={styles.mapItemContent}>
                <Text style={[styles.mapItemName, { color: colors.text }]}>{parcel.recipient.name}</Text>
                <Text style={[styles.mapItemAddress, { color: colors.textSecondary }]} numberOfLines={1}>
                  {parcel.address.street}
                </Text>
              </View>
              <StatusBadge status={parcel.status} size="small" />
            </Pressable>
          ))}
        </View>
      </View>
    );
  }

  const initialRegion = parcels.length > 0
    ? {
        latitude: parcels[0].address.coordinates.latitude,
        longitude: parcels[0].address.coordinates.longitude,
        latitudeDelta: 0.06,
        longitudeDelta: 0.06,
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
      >
        {parcels.map((parcel) => (
          <Marker
            key={parcel.id}
            coordinate={parcel.address.coordinates}
            title={`#${parcel.order} - ${parcel.recipient.name}`}
            description={parcel.address.street}
            pinColor={getMarkerColor(parcel, colors)}
            onCalloutPress={() =>
              router.push({ pathname: "/parcel/[id]", params: { id: parcel.id } })
            }
          />
        ))}
      </MapView>
    </View>
  );
}

function getMarkerColor(parcel: Parcel, colors: any): string {
  switch (parcel.status) {
    case "delivered": return colors.statusDelivered;
    case "failed": return colors.statusFailed;
    case "in_progress": return colors.statusInProgress;
    default: return colors.statusPending;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBar: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "500",
  },
  listFallback: {
    flex: 1,
    padding: 16,
    gap: 8,
  },
  mapItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  markerDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  mapItemContent: {
    flex: 1,
    gap: 2,
  },
  mapItemName: {
    fontSize: 15,
    fontWeight: "600",
  },
  mapItemAddress: {
    fontSize: 12,
  },
});
