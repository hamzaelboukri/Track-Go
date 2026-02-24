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

export default function ParcelDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { getParcelById, deliverParcel } = useTournee();

  const parcel = getParcelById(id);

  if (!parcel) {
    return <LoadingScreen message="Colis non trouve..." />;
  }

  function openMaps() {
    const { latitude, longitude } = parcel!.address.coordinates;
    const url = Platform.select({
      ios: `maps:0,0?q=${latitude},${longitude}`,
      android: `geo:${latitude},${longitude}?q=${latitude},${longitude}`,
      default: `https://www.google.com/maps?q=${latitude},${longitude}`,
    });
    Linking.openURL(url!);
  }

  function handleCall() {
    Linking.openURL(`tel:${parcel!.recipient.phone}`);
  }

  function handleDeliver() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    router.push({
      pathname: "/parcel/deliver",
      params: { id: parcel!.id, barcode: parcel!.barcode },
    });
  }

  function handleIncident() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push({
      pathname: "/parcel/incident",
      params: { id: parcel!.id },
    });
  }

  const isActionable = parcel.status === "pending" || parcel.status === "in_progress";

  return (
    <>
      <Stack.Screen
        options={{
          title: `Colis #${parcel.order}`,
          headerBackTitle: "Retour",
        }}
      />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topSection}>
          <View style={styles.statusRow}>
            <StatusBadge status={parcel.status} size="medium" />
            <PriorityBadge priority={parcel.priority} />
          </View>
          <Text style={[styles.trackingCode, { color: colors.textTertiary }]}>
            {parcel.trackingCode}
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Destinataire</Text>
          <View style={styles.cardRow}>
            <Ionicons name="person-outline" size={18} color={colors.textSecondary} />
            <Text style={[styles.cardValue, { color: colors.text }]}>{parcel.recipient.name}</Text>
          </View>
          <View style={styles.cardRow}>
            <Ionicons name="call-outline" size={18} color={colors.textSecondary} />
            <Pressable onPress={handleCall}>
              <Text style={[styles.cardValue, styles.link, { color: colors.info }]}>{parcel.recipient.phone}</Text>
            </Pressable>
          </View>
          {parcel.recipient.email && (
            <View style={styles.cardRow}>
              <Ionicons name="mail-outline" size={18} color={colors.textSecondary} />
              <Text style={[styles.cardValue, { color: colors.text }]}>{parcel.recipient.email}</Text>
            </View>
          )}
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          <View style={styles.cardTitleRow}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>Adresse</Text>
            <Pressable onPress={openMaps} hitSlop={10}>
              <Ionicons name="navigate-outline" size={20} color={colors.info} />
            </Pressable>
          </View>
          <View style={styles.cardRow}>
            <Ionicons name="location-outline" size={18} color={colors.textSecondary} />
            <Text style={[styles.cardValue, { color: colors.text }]}>
              {parcel.address.street}
            </Text>
          </View>
          <View style={styles.cardRow}>
            <Ionicons name="business-outline" size={18} color={colors.textSecondary} />
            <Text style={[styles.cardValue, { color: colors.text }]}>
              {parcel.address.postalCode} {parcel.address.city}
            </Text>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Details du colis</Text>
          <View style={styles.detailsGrid}>
            <DetailItem icon="scale-outline" label="Poids" value={`${parcel.weight} kg`} colors={colors} />
            <DetailItem icon="barcode-outline" label="Code-barres" value={parcel.barcode} colors={colors} />
            {parcel.dimensions && (
              <DetailItem
                icon="resize-outline"
                label="Dimensions"
                value={`${parcel.dimensions.length}x${parcel.dimensions.width}x${parcel.dimensions.height} cm`}
                colors={colors}
              />
            )}
          </View>
          {parcel.notes && (
            <View style={[styles.notesBox, { backgroundColor: colors.warning + "15" }]}>
              <Ionicons name="information-circle-outline" size={16} color={colors.warning} />
              <Text style={[styles.notesText, { color: colors.text }]}>{parcel.notes}</Text>
            </View>
          )}
        </View>

        {parcel.deliveryProof && (
          <View style={[styles.card, { backgroundColor: colors.success + "08", borderColor: colors.success + "30" }]}>
            <Text style={[styles.cardTitle, { color: colors.success }]}>Preuve de livraison</Text>
            <View style={styles.cardRow}>
              <Ionicons name="time-outline" size={18} color={colors.success} />
              <Text style={[styles.cardValue, { color: colors.text }]}>
                {new Date(parcel.deliveryProof.timestamp).toLocaleString("fr-FR")}
              </Text>
            </View>
            <View style={styles.cardRow}>
              <Ionicons name="location-outline" size={18} color={colors.success} />
              <Text style={[styles.cardValue, { color: colors.text }]}>
                GPS: {parcel.deliveryProof.coordinates.latitude.toFixed(4)}, {parcel.deliveryProof.coordinates.longitude.toFixed(4)}
              </Text>
            </View>
          </View>
        )}

        {parcel.incident && (
          <View style={[styles.card, { backgroundColor: colors.danger + "08", borderColor: colors.danger + "30" }]}>
            <Text style={[styles.cardTitle, { color: colors.danger }]}>Incident signale</Text>
            <Text style={[styles.cardValue, { color: colors.text }]}>{parcel.incident.description}</Text>
          </View>
        )}
      </ScrollView>

      {isActionable && (
        <View style={[styles.actionBar, { backgroundColor: colors.surface, borderTopColor: colors.border, paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 16) }]}>
          <Pressable
            onPress={handleIncident}
            style={({ pressed }) => [
              styles.actionButton,
              styles.incidentButton,
              { borderColor: colors.danger, opacity: pressed ? 0.8 : 1 },
            ]}
          >
            <Ionicons name="warning-outline" size={20} color={colors.danger} />
            <Text style={[styles.actionButtonText, { color: colors.danger }]}>Incident</Text>
          </Pressable>
          <Pressable
            onPress={handleDeliver}
            style={({ pressed }) => [
              styles.actionButton,
              styles.deliverButton,
              { backgroundColor: colors.success, opacity: pressed ? 0.9 : 1 },
            ]}
          >
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
            <Text style={[styles.actionButtonText, { color: "#fff" }]}>Valider livraison</Text>
          </Pressable>
        </View>
      )}
    </>
  );
}

function DetailItem({ icon, label, value, colors }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  colors: any;
}) {
  return (
    <View style={styles.detailItem}>
      <Ionicons name={icon} size={16} color={colors.textTertiary} />
      <Text style={[styles.detailLabel, { color: colors.textTertiary }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
    alignItems: "flex-start",
  },
  statusRow: {
    flexDirection: "row",
    gap: 8,
  },
  trackingCode: {
    fontSize: 13,
    fontWeight: "500",
    fontFamily: Platform.select({ ios: "Menlo", default: "monospace" }),
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  cardTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  cardValue: {
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  link: {
    textDecorationLine: "underline",
  },
  detailsGrid: {
    gap: 8,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: "500",
    width: 80,
  },
  detailValue: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  notesBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  notesText: {
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
    lineHeight: 18,
  },
  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  incidentButton: {
    borderWidth: 1.5,
    backgroundColor: "transparent",
  },
  deliverButton: {},
  actionButtonText: {
    fontSize: 14,
    fontWeight: "700",
  },
});
