import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Platform, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useAuth } from "@/contexts/AuthContext";
import { useTournee } from "@/contexts/TourneeContext";

export default function ProfileScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { driver, logout } = useAuth();
  const { stats } = useTournee();
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  async function handleLogout() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await logout();
    router.replace("/login");
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={{ paddingTop: insets.top + webTopInset + 8, paddingBottom: insets.bottom + 100 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>
            {driver?.firstName?.[0]}{driver?.lastName?.[0]}
          </Text>
        </View>
        <Text style={[styles.name, { color: colors.text }]}>
          {driver?.firstName} {driver?.lastName}
        </Text>
        <Text style={[styles.employeeId, { color: colors.textSecondary }]}>
          {driver?.employeeId}
        </Text>
      </View>

      <View style={[styles.infoSection, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
        <InfoRow icon="call-outline" label="Telephone" value={driver?.phone || "-"} colors={colors} />
        <View style={[styles.separator, { backgroundColor: colors.borderLight }]} />
        <InfoRow icon="car-outline" label="Vehicule" value={driver?.vehicleId || "-"} colors={colors} />
      </View>

      {stats && (
        <View style={[styles.infoSection, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Aujourd'hui</Text>
          <View style={styles.statsGrid}>
            <StatCard label="Livres" value={stats.delivered} color={colors.success} bgColor={colors.success + "15"} />
            <StatCard label="Echecs" value={stats.failed} color={colors.danger} bgColor={colors.danger + "15"} />
            <StatCard label="Restants" value={stats.pending + stats.inProgress} color={colors.statusPending} bgColor={colors.statusPending + "15"} />
            <StatCard label="Taux" value={`${stats.progressPercent}%`} color={colors.primary} bgColor={colors.primary + "15"} />
          </View>
        </View>
      )}

      <Pressable
        onPress={handleLogout}
        style={({ pressed }) => [
          styles.logoutButton,
          {
            backgroundColor: colors.danger + "12",
            borderColor: colors.danger + "30",
            opacity: pressed ? 0.8 : 1,
          },
        ]}
      >
        <Ionicons name="log-out-outline" size={20} color={colors.danger} />
        <Text style={[styles.logoutText, { color: colors.danger }]}>Se deconnecter</Text>
      </Pressable>
    </ScrollView>
  );
}

function InfoRow({ icon, label, value, colors }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  colors: any;
}) {
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon} size={20} color={colors.textTertiary} />
      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

function StatCard({ label, value, color, bgColor }: {
  label: string;
  value: number | string;
  color: string;
  bgColor: string;
}) {
  return (
    <View style={[styles.statCard, { backgroundColor: bgColor }]}>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={[styles.statLabel, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: "center",
    paddingVertical: 24,
    gap: 6,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  avatarText: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
  },
  name: {
    fontSize: 22,
    fontWeight: "800",
  },
  employeeId: {
    fontSize: 14,
    fontWeight: "500",
  },
  infoSection: {
    marginHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  separator: {
    height: 1,
  },
  statsGrid: {
    flexDirection: "row",
    gap: 8,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 10,
    gap: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
  },
  statLabel: {
    fontSize: 10,
    fontWeight: "600",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
    marginTop: 8,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: "600",
  },
});
