import React from "react";
import { View, Text, StyleSheet, ScrollView, Pressable, Platform, Linking } from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useTournee } from "@/contexts/TourneeContext";
import { StatusBadge } from "@/components/StatusBadge";
import { PriorityBadge } from "@/components/PriorityBadge";
import { LoadingScreen } from "@/components/LoadingScreen";
import { typography } from "@/constants/typography";

export default function ParcelDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { getParcelById } = useTournee();

  const parcel = getParcelById(id);

  if (!parcel) {
    return <LoadingScreen message="LECTURE DU MANIFESTE..." />;
  }

  const isActionable = parcel.status === "pending" || parcel.status === "in_progress";

  const renderSectionHeader = (num: string, title: string) => (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionNum, { color: colors.accent }]}>{num}</Text>
      <Text style={[styles.sectionTitleText, { color: colors.textTertiary }]}>{title.toUpperCase()}</Text>
      <View style={[styles.sectionLine, { backgroundColor: colors.border }]} />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          headerShown: true,
          title: `FICHE LOGISTIQUE`,
          headerTitleStyle: { fontFamily: typography.fontFamily.black, fontSize: 12 },
          headerStyle: { backgroundColor: colors.background },
          headerShadowVisible: false,
          headerTintColor: colors.text,
          headerLeft: () => (
            <Pressable onPress={() => router.back()} style={{ marginLeft: 8 }}>
              <Ionicons name="chevron-back" size={24} color={colors.text} />
            </Pressable>
          )
        }}
      />

      {/* BACKGROUND DECORATION */}
      <View style={styles.backgroundDecoration}>
        {Array.from({ length: 10 }).map((_, i) => (
          <View key={i} style={[styles.bgLine, { left: `${(i + 1) * 10}%`, backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }]} />
        ))}
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 180 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ─── TERMINAL HEADER: MISSION ID (Unified with Home) ─── */}
        <View style={styles.terminalHeader}>
          <View style={styles.idBlock}>
            <View style={styles.liveIndicatorRow}>
              <View style={[styles.pulsingLight, { backgroundColor: isActionable ? colors.accent : colors.success }]} />
              <Text style={[styles.liveTag, { color: isActionable ? colors.accent : colors.success }]}>
                {isActionable ? "MISSION_PENDING" : "MISSION_COMPLETED"}
              </Text>
            </View>
            <View style={styles.idRow}>
              <Text style={[styles.idHash, { color: colors.textTertiary }]}>#</Text>
              <Text style={[styles.idValue, { color: colors.text }]}>{parcel.order}</Text>
            </View>
          </View>

          <View style={styles.headerStatusCol}>
            <StatusBadge status={parcel.status} size="medium" />
            <PriorityBadge priority={parcel.priority} />
          </View>
        </View>

        {/* ─── TRACKING BAR ─── */}
        <View style={[styles.trackingBar, { backgroundColor: isDark ? "#0A0A0A" : "#F6F6F6", borderColor: colors.border }]}>
          <Ionicons name="barcode-outline" size={18} color={colors.textSecondary} />
          <Text style={[styles.trackingValue, { color: colors.textSecondary }]}>{parcel.trackingCode}</Text>
          <View style={styles.spacer} />
          <View style={[styles.typeBadge, { borderColor: colors.textTertiary }]}>
            <Text style={[styles.typeBadgeText, { color: colors.textTertiary }]}>BOX-A</Text>
          </View>
        </View>

        {/* ─── SECTION 01: DESTINATAIRE ─── */}
        <View style={styles.contentSection}>
          {renderSectionHeader("01", "Destinataire")}
          <View style={styles.recipientBlock}>
            <Text style={[styles.recipientName, { color: colors.text }]}>{parcel.recipient.name.toUpperCase()}</Text>
            <Pressable
              onPress={() => Linking.openURL(`tel:${parcel.recipient.phone}`)}
              style={[styles.contactButton, { borderColor: colors.border }]}
            >
              <Ionicons name="call" size={16} color={colors.accent} />
              <Text style={[styles.contactText, { color: colors.text }]}>{parcel.recipient.phone}</Text>
            </Pressable>
          </View>
        </View>

        {/* ─── SECTION 02: LOCALISATION ─── */}
        <View style={styles.contentSection}>
          {renderSectionHeader("02", "Localisation")}
          <View style={styles.addressBlock}>
            <View style={styles.addressInfo}>
              <Text style={[styles.streetText, { color: colors.text }]}>{parcel.address.street.toUpperCase()}</Text>
              <Text style={[styles.cityText, { color: colors.textSecondary }]}>
                {parcel.address.postalCode} • {parcel.address.city.toUpperCase()}
              </Text>
            </View>

            <Pressable
              onPress={() => {
                const { latitude, longitude } = parcel.address.coordinates;
                const url = Platform.select({
                  ios: `maps:0,0?q=${latitude},${longitude}`,
                  android: `geo:${latitude},${longitude}?q=${latitude},${longitude}`,
                });
                Linking.openURL(url!);
              }}
              style={[styles.navButton, { backgroundColor: colors.text }]}
            >
              <Ionicons name="location" size={20} color={colors.background} />
              <Text style={[styles.navButtonText, { color: colors.background }]}>LANCER LE GPS</Text>
            </Pressable>
          </View>
        </View>

        {/* ─── SECTION 03: PARAMÈTRES TECHNIQUES (Asymmetric Grid like Home) ─── */}
        <View style={styles.contentSection}>
          {renderSectionHeader("03", "Paramètres Techniques")}
          <View style={styles.metricsGrid}>
            <View style={[styles.techMain, { backgroundColor: isDark ? "#0A0A0A" : "#F6F6F6" }]}>
              <Text style={[styles.techMiniLabel, { color: colors.textTertiary }]}>POIDS BRUT</Text>
              <Text style={[styles.techLargeValue, { color: colors.text }]}>{parcel.weight} KG</Text>
              <View style={[styles.accentCorner, { borderTopColor: colors.accent, borderRightColor: colors.accent }]} />
            </View>
            <View style={styles.techSideCol}>
              <View style={[styles.techSmall, { backgroundColor: isDark ? "#0A0A0A" : "#F6F6F6" }]}>
                <Text style={[styles.techMiniLabel, { color: colors.textTertiary }]}>CONTENU</Text>
                <Text style={[styles.techSmallValue, { color: colors.text }]}>STANDARD</Text>
              </View>
              <View style={[styles.techSmall, { backgroundColor: isDark ? "#0A0A0A" : "#F6F6F6" }]}>
                <Text style={[styles.techMiniLabel, { color: colors.textTertiary }]}>VOLUME</Text>
                <Text style={[styles.techSmallValue, { color: colors.text }]}>BOX-A</Text>
              </View>
            </View>
          </View>

          {parcel.notes && (
            <View style={[styles.notesContainer, { borderLeftColor: colors.accent, backgroundColor: isDark ? "#0A0A0A" : "#F9F9F9" }]}>
              <Text style={[styles.notesLabel, { color: colors.textSecondary }]}>INSTRUCTIONS OPÉRATIONNELLES:</Text>
              <Text style={[styles.notesContent, { color: colors.text }]}>{parcel.notes}</Text>
            </View>
          )}
        </View>

        {/* ─── INCIDENT / COMPLETION STATUS ─── */}
        {(parcel.deliveryProof || parcel.incident) && (
          <View style={[styles.terminalStatusBlock, { borderColor: parcel.incident ? colors.danger : colors.success }]}>
            <Ionicons
              name={parcel.incident ? "warning-outline" : "checkmark-circle-outline"}
              size={28}
              color={parcel.incident ? colors.danger : colors.success}
            />
            <View style={styles.statusInfo}>
              <Text style={[styles.statusTitle, { color: parcel.incident ? colors.danger : colors.success }]}>
                {parcel.incident ? "ANOMALIE DÉTECTÉE" : "OPÉRATION RÉUSSIE"}
              </Text>
              <Text style={[styles.statusDesc, { color: colors.textSecondary }]}>
                {parcel.incident ? parcel.incident.description : `MANIFESTE CLÔTURÉ LE ${new Date(parcel.deliveryProof!.timestamp).toLocaleDateString('fr-FR')}`}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ─── ACTION TERMINAL ─── */}
      {isActionable && (
        <View style={[styles.actionTerminal, { backgroundColor: colors.background, paddingBottom: insets.bottom + 24 }]}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push({ pathname: "/parcel/incident", params: { id: parcel.id } });
            }}
            style={[styles.incidentBtn, { borderColor: colors.danger }]}
          >
            <Ionicons name="warning-outline" size={24} color={colors.danger} />
          </Pressable>

          <Pressable
            onPress={() => {
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.push({ pathname: "/parcel/deliver", params: { id: parcel.id, barcode: parcel.barcode } });
            }}
            style={[styles.confirmBtn, { backgroundColor: isDark ? colors.text : "#000" }]}
          >
            <Text style={[styles.confirmText, { color: isDark ? colors.background : "#FFF" }]}>VALIDER L'ÉTAPE</Text>
            <View style={styles.btnIconBox}>
              <Ionicons name="arrow-forward" size={18} color={isDark ? colors.background : "#FFF"} />
            </View>
          </Pressable>
        </View>
      )}
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
  terminalHeader: {
    paddingHorizontal: 24,
    paddingTop: 32,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 24,
  },
  idBlock: { gap: 4 },
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
  idRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 4,
  },
  idHash: {
    fontSize: 24,
    fontFamily: typography.fontFamily.black,
    marginBottom: 8,
  },
  idValue: {
    fontSize: 56,
    fontFamily: typography.fontFamily.bold,
    lineHeight: 56,
    letterSpacing: -1,
  },
  headerStatusCol: {
    gap: 12,
    alignItems: "flex-end",
    paddingBottom: 4,
  },
  trackingBar: {
    marginHorizontal: 24,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 32,
  },
  trackingValue: {
    fontSize: 13,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 3,
  },
  spacer: { flex: 1 },
  typeBadge: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  typeBadgeText: {
    fontSize: 8,
    fontFamily: typography.fontFamily.black,
  },

  contentSection: {
    paddingHorizontal: 24,
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
    fontFamily: typography.fontFamily.black,
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
  recipientBlock: {
    gap: 12,
  },
  recipientName: {
    fontSize: 22,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: -0.5,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignSelf: 'flex-start',
  },
  contactText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 0.5,
  },
  addressBlock: {
    gap: 16,
  },
  addressInfo: { gap: 4 },
  streetText: {
    fontSize: 18,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: -0.5,
    lineHeight: 22,
  },
  cityText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 1,
  },
  navButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: 18,
  },
  navButtonText: {
    fontSize: 13,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 2,
  },
  metricsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  techMain: {
    flex: 1.4,
    padding: 16,
    justifyContent: "center",
    position: "relative",
  },
  accentCorner: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 12,
    height: 12,
    borderTopWidth: 2,
    borderRightWidth: 2,
  },
  techSideCol: {
    flex: 1,
    gap: 12,
  },
  techSmall: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  techMiniLabel: {
    fontSize: 8,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 1,
    marginBottom: 4,
  },
  techLargeValue: {
    fontSize: 22,
    fontFamily: typography.fontFamily.bold,
  },
  techSmallValue: {
    fontSize: 14,
    fontFamily: typography.fontFamily.bold,
  },
  notesContainer: {
    borderLeftWidth: 3,
    paddingLeft: 16,
    paddingVertical: 12,
    paddingRight: 12,
    gap: 6,
    marginTop: 8,
  },
  notesLabel: {
    fontSize: 9,
    fontFamily: typography.fontFamily.black,
    letterSpacing: 1,
  },
  notesContent: {
    fontSize: 15,
    fontFamily: typography.fontFamily.medium,
    lineHeight: 22,
  },
  terminalStatusBlock: {
    marginHorizontal: 24,
    borderWidth: 2,
    padding: 20,
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
    marginTop: 10,
  },
  statusInfo: {
    flex: 1,
    gap: 4,
  },
  statusTitle: {
    fontSize: 13,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 1,
  },
  statusDesc: {
    fontSize: 11,
    fontFamily: typography.fontFamily.bold,
    lineHeight: 16,
  },
  actionTerminal: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 12,
  },
  incidentBtn: {
    width: 64,
    height: 64,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  confirmBtn: {
    flex: 1,
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  confirmText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.black,
    letterSpacing: 2,
  },
  btnIconBox: {
    padding: 4,
  }
});
