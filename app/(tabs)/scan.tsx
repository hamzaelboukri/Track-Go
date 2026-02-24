import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, Pressable, Platform, TextInput, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useTournee } from "@/contexts/TourneeContext";

export default function ScanScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { tour } = useTournee();
  const [manualCode, setManualCode] = useState("");
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState("");
  const webTopInset = Platform.OS === "web" ? 67 : 0;

  function findParcelByBarcode(barcode: string) {
    return tour?.parcels.find(
      (p) => p.barcode === barcode || p.trackingCode === barcode
    );
  }

  function handleManualSubmit() {
    setError("");
    const code = manualCode.trim();
    if (!code) {
      setError("Veuillez entrer un code");
      return;
    }
    const parcel = findParcelByBarcode(code);
    if (parcel) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setScanResult(null);
      setManualCode("");
      router.push({ pathname: "/parcel/[id]", params: { id: parcel.id } });
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError("Code-barres non reconnu dans la tournee");
    }
  }

  const pendingCount = tour?.parcels.filter(
    (p) => p.status === "pending" || p.status === "in_progress"
  ).length || 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top + webTopInset }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Scanner un colis</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {pendingCount} colis en attente de scan
        </Text>
      </View>

      <View style={styles.content}>
        <View style={[styles.scanArea, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={[styles.scanIconContainer, { backgroundColor: colors.primary + "10" }]}>
            <Ionicons name="scan" size={64} color={colors.primary} />
          </View>
          <Text style={[styles.scanHint, { color: colors.textSecondary }]}>
            Utilisez la camera de votre appareil pour scanner le code-barres du colis
          </Text>
          <Text style={[styles.scanNote, { color: colors.textTertiary }]}>
            Le scan camera est disponible sur appareil physique via Expo Go
          </Text>
        </View>

        <View style={styles.divider}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.textTertiary }]}>OU</Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        <View style={styles.manualEntry}>
          <Text style={[styles.manualLabel, { color: colors.textSecondary }]}>Saisie manuelle</Text>
          <View style={[styles.inputRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Ionicons name="barcode-outline" size={20} color={colors.textTertiary} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              value={manualCode}
              onChangeText={setManualCode}
              placeholder="Code-barres ou code de suivi"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="characters"
              returnKeyType="search"
              onSubmitEditing={handleManualSubmit}
            />
            <Pressable
              onPress={handleManualSubmit}
              style={({ pressed }) => [
                styles.submitButton,
                { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
              ]}
            >
              <Ionicons name="arrow-forward" size={20} color="#fff" />
            </Pressable>
          </View>
          {!!error && (
            <View style={[styles.errorRow, { backgroundColor: colors.danger + "12" }]}>
              <Ionicons name="alert-circle-outline" size={14} color={colors.danger} />
              <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
            </View>
          )}
        </View>

        <View style={[styles.recentSection, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
          <Text style={[styles.recentTitle, { color: colors.text }]}>Codes de test</Text>
          {tour?.parcels.slice(0, 3).map((p) => (
            <Pressable
              key={p.id}
              onPress={() => {
                setManualCode(p.barcode);
              }}
              style={({ pressed }) => [
                styles.recentItem,
                { backgroundColor: pressed ? colors.surfaceSecondary : "transparent" },
              ]}
            >
              <Ionicons name="barcode-outline" size={16} color={colors.textTertiary} />
              <View style={styles.recentItemContent}>
                <Text style={[styles.recentCode, { color: colors.text }]}>{p.barcode}</Text>
                <Text style={[styles.recentName, { color: colors.textTertiary }]}>
                  {p.recipient.name}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
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
  content: {
    flex: 1,
    padding: 16,
    gap: 20,
  },
  scanArea: {
    alignItems: "center",
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    gap: 12,
  },
  scanIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  scanHint: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
  scanNote: {
    fontSize: 11,
    textAlign: "center",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 12,
    fontWeight: "600",
  },
  manualEntry: {
    gap: 8,
  },
  manualLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 4,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingLeft: 14,
    height: 50,
    gap: 10,
    overflow: "hidden",
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: "100%",
  },
  submitButton: {
    width: 50,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  errorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 12,
    fontWeight: "500",
  },
  recentSection: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 8,
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  recentItemContent: {
    flex: 1,
    gap: 1,
  },
  recentCode: {
    fontSize: 13,
    fontWeight: "600",
    fontFamily: Platform.select({ ios: "Menlo", default: "monospace" }),
  },
  recentName: {
    fontSize: 11,
  },
});
