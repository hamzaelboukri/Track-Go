import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Platform, TextInput, Alert } from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from "expo-camera";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useTournee } from "@/contexts/TourneeContext";
import type { GeoCoordinates } from "../../shared/schema";

export default function DeliverScreen() {
  const { id, barcode } = useLocalSearchParams<{ id: string; barcode: string }>();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { getParcelById, deliverParcel } = useTournee();
  const parcel = getParcelById(id);

  const [scannedCode, setScannedCode] = useState("");
  const [location, setLocation] = useState<GeoCoordinates | null>(null);
  const [locationError, setLocationError] = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [barcodeMatch, setBarcodeMatch] = useState<boolean | null>(null);
  const [showScanner, setShowScanner] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [scanLocked, setScanLocked] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const unlockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    requestLocation();
  }, []);

  async function requestLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError("Permission de localisation refusee");
        setIsLoadingLocation(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    } catch (e) {
      setLocationError("Impossible d'obtenir la position GPS");
    } finally {
      setIsLoadingLocation(false);
    }
  }

  function handleBarcodeCheck() {
    const match = scannedCode.trim() === barcode;
    setBarcodeMatch(match);
    if (match) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  async function handleOpenScanner() {
    if (Platform.OS === "web") {
      Alert.alert("Non disponible", "Le scanner camera est disponible sur mobile uniquement.");
      return;
    }
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert("Permission requise", "Autorisez la camera pour scanner le code-barres.");
        return;
      }
    }
    setShowScanner(true);
  }

  function handleBarcodeScanned(result: BarcodeScanningResult) {
    if (scanLocked) return;
    const code = result.data?.trim();
    if (!code) return;

    setScanLocked(true);
    setScannedCode(code);
    const match = code === barcode;
    setBarcodeMatch(match);

    if (match) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowScanner(false);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }

    if (unlockTimeoutRef.current) {
      clearTimeout(unlockTimeoutRef.current);
    }
    unlockTimeoutRef.current = setTimeout(() => setScanLocked(false), 1200);
  }

  useEffect(() => {
    return () => {
      if (unlockTimeoutRef.current) {
        clearTimeout(unlockTimeoutRef.current);
      }
    };
  }, []);

  async function handleConfirm() {
    if (!barcodeMatch) {
      Alert.alert("Erreur", "Le code-barres ne correspond pas au colis");
      return;
    }
    if (!location) {
      Alert.alert("Erreur", "Position GPS requise pour valider la livraison");
      return;
    }
    setIsSubmitting(true);
    try {
      await deliverParcel(id, {
        scannedBarcode: scannedCode.trim(),
        coordinates: location,
        timestamp: new Date().toISOString(),
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
      router.back();
    } catch (e: any) {
      Alert.alert("Erreur", e.message || "Erreur lors de la validation");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: "Valider livraison", headerBackTitle: "Retour" }} />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.content}>
          <View style={[styles.stepCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <View style={styles.stepHeader}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={[styles.stepTitle, { color: colors.text }]}>Scanner le code-barres</Text>
            </View>
            <Text style={[styles.stepDesc, { color: colors.textSecondary }]}>
              Code attendu: {barcode}
            </Text>
            <View style={[styles.barcodeInput, { borderColor: colors.border, backgroundColor: colors.surfaceSecondary }]}>
              <Ionicons name="barcode-outline" size={20} color={colors.textTertiary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={scannedCode}
                onChangeText={(t) => { setScannedCode(t); setBarcodeMatch(null); }}
                placeholder="Entrez le code-barres"
                placeholderTextColor={colors.textTertiary}
                returnKeyType="done"
                onSubmitEditing={handleBarcodeCheck}
              />
              <Pressable
                onPress={handleBarcodeCheck}
                style={({ pressed }) => [
                  styles.checkButton,
                  { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 },
                ]}
              >
                <Ionicons name="checkmark" size={18} color="#fff" />
              </Pressable>
            </View>
            <View style={styles.scannerActions}>
              <Pressable
                onPress={handleOpenScanner}
                style={({ pressed }) => [
                  styles.scannerActionButton,
                  { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
                ]}
              >
                <Ionicons name="camera-outline" size={18} color="#fff" />
                <Text style={styles.scannerActionText}>Scanner avec la camera</Text>
              </Pressable>
            </View>
            {showScanner && permission?.granted && (
              <View style={styles.scannerWrap}>
                <CameraView
                  style={styles.scannerCamera}
                  facing="back"
                  enableTorch={torchEnabled}
                  barcodeScannerSettings={{
                    barcodeTypes: [
                      "ean13",
                      "ean8",
                      "upc_a",
                      "upc_e",
                      "code128",
                      "code39",
                      "code93",
                      "codabar",
                      "itf14",
                      "qr",
                      "pdf417",
                      "aztec",
                      "datamatrix",
                    ],
                  }}
                  onBarcodeScanned={handleBarcodeScanned}
                />
                <View style={[styles.scannerOverlay, { borderColor: colors.primary }]} />
                <View style={styles.scannerFooter}>
                  <Pressable
                    onPress={() => setTorchEnabled((value) => !value)}
                    style={({ pressed }) => [
                      styles.scannerFooterButton,
                      { backgroundColor: colors.surfaceSecondary, opacity: pressed ? 0.85 : 1 },
                    ]}
                  >
                    <Ionicons name={torchEnabled ? "flash" : "flash-off"} size={16} color={colors.text} />
                    <Text style={[styles.scannerFooterText, { color: colors.text }]}>
                      {torchEnabled ? "Lampe ON" : "Lampe OFF"}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => setShowScanner(false)}
                    style={({ pressed }) => [
                      styles.scannerFooterButton,
                      { backgroundColor: colors.surfaceSecondary, opacity: pressed ? 0.85 : 1 },
                    ]}
                  >
                    <Ionicons name="close" size={16} color={colors.text} />
                    <Text style={[styles.scannerFooterText, { color: colors.text }]}>Fermer</Text>
                  </Pressable>
                </View>
              </View>
            )}
            {barcodeMatch === true && (
              <View style={[styles.resultRow, { backgroundColor: colors.success + "15" }]}>
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                <Text style={[styles.resultText, { color: colors.success }]}>Code-barres valide</Text>
              </View>
            )}
            {barcodeMatch === false && (
              <View style={[styles.resultRow, { backgroundColor: colors.danger + "15" }]}>
                <Ionicons name="close-circle" size={18} color={colors.danger} />
                <Text style={[styles.resultText, { color: colors.danger }]}>Code-barres incorrect</Text>
              </View>
            )}
          </View>

          <View style={[styles.stepCard, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
            <View style={styles.stepHeader}>
              <View style={[styles.stepNumber, { backgroundColor: colors.primary }]}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={[styles.stepTitle, { color: colors.text }]}>Position GPS</Text>
            </View>
            {isLoadingLocation ? (
              <View style={styles.locationLoading}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={[styles.locationText, { color: colors.textSecondary }]}>
                  Acquisition GPS en cours...
                </Text>
              </View>
            ) : location ? (
              <View style={[styles.resultRow, { backgroundColor: colors.success + "15" }]}>
                <Ionicons name="location" size={18} color={colors.success} />
                <Text style={[styles.resultText, { color: colors.success }]}>
                  Position capturee ({location.latitude.toFixed(4)}, {location.longitude.toFixed(4)})
                </Text>
              </View>
            ) : (
              <View style={[styles.resultRow, { backgroundColor: colors.danger + "15" }]}>
                <Ionicons name="location-outline" size={18} color={colors.danger} />
                <Text style={[styles.resultText, { color: colors.danger }]}>{locationError}</Text>
                <Pressable onPress={requestLocation} hitSlop={10}>
                  <Ionicons name="refresh" size={18} color={colors.danger} />
                </Pressable>
              </View>
            )}
          </View>
        </View>

        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 16) }]}>
          <Pressable
            onPress={handleConfirm}
            disabled={!barcodeMatch || !location || isSubmitting}
            style={({ pressed }) => [
              styles.confirmButton,
              {
                backgroundColor: barcodeMatch && location ? colors.success : colors.textTertiary,
                opacity: pressed ? 0.9 : isSubmitting ? 0.7 : 1,
              },
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={22} color="#fff" />
                <Text style={styles.confirmText}>Confirmer la livraison</Text>
              </>
            )}
          </Pressable>
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
    gap: 16,
  },
  stepCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  stepHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  stepDesc: {
    fontSize: 13,
    fontWeight: "500",
    fontFamily: Platform.select({ ios: "Menlo", default: "monospace" }),
  },
  barcodeInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 10,
    paddingLeft: 12,
    height: 48,
    gap: 8,
    overflow: "hidden",
  },
  input: {
    flex: 1,
    fontSize: 15,
    height: "100%",
  },
  checkButton: {
    width: 48,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  scannerActions: {
    marginTop: 2,
  },
  scannerActionButton: {
    height: 40,
    borderRadius: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  scannerActionText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  scannerWrap: {
    marginTop: 10,
    width: "100%",
    height: 220,
    borderRadius: 12,
    overflow: "hidden",
  },
  scannerCamera: {
    width: "100%",
    height: "100%",
  },
  scannerOverlay: {
    position: "absolute",
    left: "14%",
    top: "26%",
    width: "72%",
    height: "44%",
    borderWidth: 2,
    borderRadius: 14,
    backgroundColor: "transparent",
  },
  scannerFooter: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 10,
    flexDirection: "row",
    gap: 8,
  },
  scannerFooterButton: {
    flex: 1,
    height: 34,
    borderRadius: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  scannerFooterText: {
    fontSize: 12,
    fontWeight: "600",
  },
  resultRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
  },
  resultText: {
    fontSize: 13,
    fontWeight: "600",
    flex: 1,
  },
  locationLoading: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  locationText: {
    fontSize: 13,
    fontWeight: "500",
  },
  bottomBar: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  confirmButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    borderRadius: 12,
    gap: 8,
  },
  confirmText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
