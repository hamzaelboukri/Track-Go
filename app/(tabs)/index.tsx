import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Platform,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Stack, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useTournee } from "@/contexts/TourneeContext";
import { ParcelCard } from "@/components/ParcelCard";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ParcelFilter, type FilterType } from "@/components/ParcelFilter";
import { RealtimeStatusIndicator } from "@/components/RealtimeStatusIndicator";
import { typography } from "@/constants/typography";

export default function TourneeScreen() {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { tour, isLoading, isRefreshing, refetch, stats } = useTournee();
  const [filter, setFilter] = useState<FilterType>("all");
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  if (isLoading && !tour) return <LoadingScreen message="LECTURE DU MANIFESTE..." />;

  const filteredParcels = (tour?.parcels || []).filter((p) => {
    if (filter === "all") return true;
    if (filter === "pending") return p.status === "pending" || p.status === "in_progress";
    if (filter === "delivered") return p.status === "delivered";
    if (filter === "failed") return p.status === "failed";
    return true;
  });

  const renderHeader = () => (
    <View style={styles.header}>
      {/* ─── CREATIVE LAYERED LOGISTIC INTERFACE ─── */}
      <View style={styles.operationalTerminal}>

        <View style={styles.heroSection}>
          <View style={styles.titleWrapper}>
            <View style={styles.liveIndicatorRow}>
              <View style={[styles.pulsingLight, { backgroundColor: colors.success }]} />
              <Text style={[styles.liveTag, { color: colors.success }]}>SYSTEM ACTIVE</Text>
            </View>
            <Text style={[styles.megaTitle, { color: colors.text }]}>MA TOURNEE</Text>
            <View style={[styles.dateBracket, { borderColor: colors.border }]}>
              <Text style={[styles.dateText, { color: colors.textTertiary }]}>
                {new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase()}
              </Text>
            </View>
          </View>
        </View>

        {/* ASYMMETRIC METRICS GRID - Refined gaps */}
        <View style={styles.metricsGrid}>
          <View style={[styles.metricMain, { backgroundColor: isDark ? "#0A0A0A" : "#F6F6F6" }]}>
            <Text style={[styles.metricMiniLabel, { color: colors.textTertiary }]}>TOTAL MISSIONS</Text>
            <Text style={[styles.metricLargeValue, { color: colors.text }]}>{stats?.total || 0}</Text>
            <View style={[styles.accentCorner, { borderTopColor: colors.accent, borderRightColor: colors.accent }]} />
          </View>
          <View style={styles.metricSideCol}>
            <View style={[styles.metricSmall, { backgroundColor: isDark ? "#0A0A0A" : "#F6F6F6" }]}>
              <Text style={[styles.metricMiniLabel, { color: colors.textTertiary }]}>RESTANT</Text>
              <Text style={[styles.metricSmallValue, { color: colors.text }]}>{stats?.pending || 0}</Text>
            </View>
            <View style={[styles.metricSmall, { backgroundColor: isDark ? "#0A0A0A" : "#F6F6F6" }]}>
              <Text style={[styles.metricMiniLabel, { color: colors.textTertiary }]}>ÉCHECS</Text>
              <Text style={[styles.metricSmallValue, { color: colors.danger }]}>{stats?.failed || 0}</Text>
            </View>
          </View>
        </View>

        {/* MODERN PROGRESS TERMINAL */}
        <View style={styles.progressTerminal}>
          <View style={styles.progressInfoRow}>
            <Text style={[styles.progressPercentText, { color: colors.text }]}>{stats?.progressPercent || 0}% COMPLETÉ</Text>
            <View style={[styles.statusTag, { backgroundColor: colors.accent }]}>
              <Text style={styles.statusTagText}>PRIORITÉ HAUTE</Text>
            </View>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: isDark ? "#141414" : "#EEE" }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: colors.accent, width: `${stats?.progressPercent || 0}%` }
              ]}
            />
            {/* Visual sub-markers */}
            <View style={[styles.trackMarker, { left: '25%' }]} />
            <View style={[styles.trackMarker, { left: '50%' }]} />
            <View style={[styles.trackMarker, { left: '75%' }]} />
          </View>
        </View>
      </View>

      <View style={styles.filterWrapper}>
        <ParcelFilter
          activeFilter={filter}
          onFilterChange={setFilter}
          counts={{
            all: stats?.total || 0,
            pending: stats?.pending || 0,
            delivered: stats?.delivered || 0,
            failed: stats?.failed || 0,
          }}
        />
      </View>

      <RealtimeStatusIndicator
        isOffline={false}
        isRefreshing={isRefreshing}
        lastUpdate={new Date()}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* BACKGROUND GRID DECORATION */}
      <View style={styles.backgroundDecoration}>
        {Array.from({ length: 10 }).map((_, i) => (
          <View key={i} style={[styles.bgLine, { left: `${(i + 1) * 10}%`, backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }]} />
        ))}
      </View>

      <FlatList
        data={filteredParcels}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ParcelCard parcel={item} onPress={() => router.push(`/parcel/${item.id}`)} />
        )}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={{
          paddingTop: insets.top + webTopInset,
          paddingBottom: 150,
        }}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refetch} tintColor={colors.text} />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
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
  header: {
    paddingBottom: 12,
  },
  operationalTerminal: {
    paddingHorizontal: 24,
    paddingTop: 24, // Increased top padding
    gap: 32, // Increased global gap for better breathing room
  },
  terminalTopLine: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4, // Added dedicated margin
  },
  terminalIdentity: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8, // Increased gap
  },
  terminalIdText: {
    fontSize: 9, // Slightly larger
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 2.5, // Increased spacing
  },
  terminalClock: {
    backgroundColor: "transparent",
  },
  clockText: {
    fontSize: 8,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 1.5,
  },
  heroSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 8, // Added margin
  },
  titleWrapper: { gap: 6 }, // Increased gap
  liveIndicatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10, // Increased gap
    marginBottom: 6,
  },
  pulsingLight: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  liveTag: {
    fontSize: 10, // Slightly larger
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 2,
  },
  megaTitle: {
    fontSize: 32,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: -1,
    lineHeight: 34,
  },
  dateBracket: {
    borderLeftWidth: 3, // Bolder bracket
    paddingLeft: 10,
    marginTop: 8,
  },
  dateText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 2,
  },
  terminalCounter: {
    width: 100, // Slightly larger
    height: 100,
    borderWidth: 2,
    justifyContent: "flex-end",
    alignItems: "center",
    overflow: "hidden",
  },
  counterValue: {
    fontSize: 28,
    fontFamily: typography.fontFamily.bold,
    marginBottom: 6,
  },
  counterFill: {
    height: 28, // Larger fill
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterLabel: {
    fontSize: 9,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 2,
    position: 'absolute',
    bottom: 6,
  },
  metricsGrid: {
    flexDirection: "row",
    gap: 16, // Increased grid gap
  },
  metricMain: {
    flex: 1.5,
    padding: 20, // More breathing room
    justifyContent: "center",
    position: "relative",
  },
  accentCorner: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 16, // Larger corner
    height: 16,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  metricSideCol: {
    flex: 1,
    gap: 16, // Increased vertical gap
  },
  metricSmall: {
    flex: 1,
    padding: 14,
    justifyContent: "center",
  },
  metricMiniLabel: {
    fontSize: 9,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  metricLargeValue: {
    fontSize: 24,
    fontFamily: typography.fontFamily.bold,
  },
  metricSmallValue: {
    fontSize: 16,
    fontFamily: typography.fontFamily.bold,
  },
  progressTerminal: {
    gap: 16, // Increased gap
    marginTop: 8,
  },
  progressInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressPercentText: {
    fontSize: 13,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 1,
  },
  statusTag: {
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  statusTagText: {
    fontSize: 9,
    fontFamily: typography.fontFamily.black,
    color: "#000",
    letterSpacing: 1,
  },
  progressTrack: {
    height: 8, // Bolder track
    width: "100%",
    position: 'relative',
  },
  progressFill: {
    height: "100%",
  },
  trackMarker: {
    position: 'absolute',
    width: 1.5,
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  filterWrapper: {
    marginTop: 24,
  }
});
