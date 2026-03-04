import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuth } from "@/contexts/AuthContext";
import { useTournee } from "@/contexts/TourneeContext";
import { typography } from "@/constants/typography";

export default function ProfileScreen() {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { driver, logout } = useAuth();
  const { stats } = useTournee();
  const webTopInset = Platform.select({ web: 67, default: 0 });

  async function handleLogout() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await logout();
    router.replace("/login");
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: insets.top + webTopInset, paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      {/* ─── PROFESSIONAL IDENTITY BLOCK ─── */}
      <View style={styles.identitySection}>
        <View style={[styles.avatarBox, { borderColor: isDark ? colors.text : "#000" }]}>
          <Text style={[styles.avatarText, { color: isDark ? colors.text : "#000" }]}>
            {driver?.firstName?.[0]}{driver?.lastName?.[0]}
          </Text>
        </View>
        <View style={styles.identityDetails}>
          <Text style={[styles.driverTag, { color: colors.accent, backgroundColor: colors.accent + "15" }]}>PROFESSIONNEL VÉRIFIÉ</Text>
          <Text style={[styles.nameText, { color: colors.text }]}>{driver?.firstName} {driver?.lastName}</Text>
          <Text style={[styles.idText, { color: colors.textSecondary }]}>MATRICULE: {driver?.employeeId}</Text>
        </View>
      </View>

      {/* ─── PERFORMANCE METRICS ─── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>METRIQUES DE PERFORMANCE</Text>
          <View style={[styles.liveDot, { backgroundColor: colors.success }]} />
        </View>
        <View style={styles.metricsWrapper}>
          <MetricItem label="LIVRAISONS" value={stats?.delivered || 0} color={colors.text} />
          <View style={[styles.verticalDivider, { backgroundColor: colors.border }]} />
          <MetricItem label="EFFICACITÉ" value={`${stats?.progressPercent || 0}%`} color={colors.accent} />
        </View>
      </View>

      {/* ─── DATA GRID ─── */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.textTertiary }]}>DONNÉES VÉHICULE & CONTACT</Text>
        <View style={styles.dataGrid}>
          <DataCard label="VÉHICULE" value={driver?.vehicleId || "—"} icon="car" colors={colors} isDark={isDark} />
          <DataCard label="CONTACT" value={driver?.phone || "—"} icon="call" colors={colors} isDark={isDark} />
        </View>
      </View>

      {/* ─── ACTIONS ─── */}
      <View style={styles.actionSection}>
        <Pressable
          onPress={handleLogout}
          style={({ pressed }) => [
            styles.logoutBtn,
            { backgroundColor: isDark ? "#141414" : "#F6F6F6", opacity: pressed ? 0.7 : 1 }
          ]}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={[styles.logoutText, { color: colors.danger }]}>DÉCONNEXION DE LA SESSION</Text>
        </Pressable>
        <Text style={[styles.versionText, { color: colors.textTertiary }]}>KOLIGO LOGISTICS V1.0.4</Text>
      </View>
    </ScrollView>
  );
}

function MetricItem({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <View style={styles.metricItem}>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
      <Text style={[styles.metricLabel, { color: "#666" }]}>{label}</Text>
    </View>
  );
}

function DataCard({ label, value, icon, colors, isDark }: { label: string; value: string; icon: any; colors: any; isDark: boolean }) {
  return (
    <View style={[styles.dataCard, { backgroundColor: isDark ? "#121212" : "#F6F6F6" }]}>
      <Ionicons name={icon} size={20} color={colors.textTertiary} />
      <View>
        <Text style={[styles.dataLabel, { color: colors.textTertiary }]}>{label}</Text>
        <Text style={[styles.dataValue, { color: colors.text }]}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  identitySection: {
    paddingHorizontal: 32,
    marginTop: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
  },
  avatarBox: {
    width: 80,
    height: 80,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 28,
    fontFamily: typography.fontFamily.black,
  },
  identityDetails: { gap: 4 },
  driverTag: {
    fontSize: 9,
    fontFamily: typography.fontFamily.black,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: "flex-start",
    letterSpacing: 1,
  },
  nameText: {
    fontSize: 24,
    fontFamily: typography.fontFamily.black,
    letterSpacing: -0.5,
  },
  idText: {
    fontSize: 11,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 1,
  },
  section: {
    paddingHorizontal: 32,
    marginTop: 48,
    gap: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: typography.fontFamily.black,
    letterSpacing: 2,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  metricsWrapper: {
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#EEE",
    paddingVertical: 24,
    alignItems: "center",
  },
  metricItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  metricValue: {
    fontSize: 32,
    fontFamily: typography.fontFamily.black,
  },
  metricLabel: {
    fontSize: 10,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 1,
  },
  verticalDivider: {
    width: 1,
    height: 40,
  },
  dataGrid: {
    flexDirection: "row",
    gap: 12,
  },
  dataCard: {
    flex: 1,
    padding: 20,
    gap: 12,
  },
  dataLabel: {
    fontSize: 10,
    fontFamily: typography.fontFamily.black,
    letterSpacing: 1,
  },
  dataValue: {
    fontSize: 15,
    fontFamily: typography.fontFamily.bold,
  },
  actionSection: {
    marginTop: 64,
    paddingHorizontal: 32,
    gap: 20,
    alignItems: "center",
  },
  logoutBtn: {
    width: "100%",
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  logoutText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.black,
    letterSpacing: 1,
  },
  versionText: {
    fontSize: 9,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 2,
  }
});
