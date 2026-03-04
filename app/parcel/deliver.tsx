import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, ActivityIndicator, Platform, TextInput, Alert, ScrollView, StatusBar } from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as Haptics from "expo-haptics";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useTournee } from "@/contexts/TourneeContext";
import { typography } from "@/constants/typography";
import { PhotoCapture } from "@/components/PhotoCapture";
import { SignatureCapture } from "@/components/SignatureCapture";
import type { PhotoResult } from "@/services/imageService";
import type { SignatureResult } from "@/services/signatureService";
import type { GeoCoordinates } from "../../shared/schema";

export default function DeliverScreen() {
  const { id, barcode } = useLocalSearchParams<{ id: string; barcode: string }>();
  const { colors, isDark } = useAppTheme();
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
  const [permission, requestPermission] = useCameraPermissions();
  const [photo, setPhoto] = useState<PhotoResult | null>(null);
  const [signature, setSignature] = useState<SignatureResult | null>(null);

  useEffect(() => {
    requestLocation();
  }, []);

  async function requestLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLocationError("GPS NON AUTORISÉ");
        setIsLoadingLocation(false);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    } catch (e) {
      setLocationError("ERREUR GPS");
    } finally {
      setIsLoadingLocation(false);
    }
  }

  function handleVerify() {
    const match = scannedCode.trim().toUpperCase() === barcode?.trim().toUpperCase();
    setBarcodeMatch(match);
    if (match) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }

  async function handleConfirm() {
    if (!barcodeMatch) { Alert.alert("ERREUR", "CODE-BARRES NON VALIDE"); return; }
    if (!location) { Alert.alert("ERREUR", "POSITION GPS REQUISE"); return; }
    if (!photo) { Alert.alert("ERREUR", "PHOTO REQUISE"); return; }
    if (!signature) { Alert.alert("ERREUR", "SIGNATURE REQUISE"); return; }
    setIsSubmitting(true);
    try {
      await deliverParcel(id, {
        scannedBarcode: scannedCode.trim().toUpperCase(),
        coordinates: location,
        timestamp: new Date().toISOString(),
        photoUri: photo.uri,
        signatureUri: signature.base64,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.dismiss(2);
    } catch (e: any) {
      Alert.alert("ERREUR", e.message || "ÉCHEC DE VALIDATION");
    } finally {
      setIsSubmitting(false);
    }
  }

  const renderSectionHeader = (num: string, title: string) => (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionNum, { color: colors.accent }]}>{num}</Text>
      <Text style={[styles.sectionTitleText, { color: colors.textTertiary }]}>{title.toUpperCase()}</Text>
      <View style={[styles.sectionLine, { backgroundColor: colors.border }]} />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} />
      <Stack.Screen options={{
        title: "CONFIRMATION DE LIVRAISON",
        headerTitleStyle: { fontFamily: typography.fontFamily.bold, fontSize: 12 },
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
      }} />

      {/* BACKGROUND DECORATION */}
      <View style={styles.backgroundDecoration}>
        {Array.from({ length: 10 }).map((_, i) => (
          <View key={i} style={[styles.bgLine, { left: `${(i + 1) * 10}%`, backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }]} />
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 150, paddingHorizontal: 24, paddingTop: 20 }}>

        {/* ─── TECHNICAL HEADER ─── */}
        <View style={styles.terminalHeader}>
          <View style={styles.headerInfoRow}>
            <View style={styles.liveIndicatorRow}>
              <View style={[styles.pulsingLight, { backgroundColor: colors.accent }]} />
              <Text style={[styles.liveTag, { color: colors.accent }]}>DELIVERY_VALIDATION_ACTIVE</Text>
            </View>
            <Text style={[styles.terminalId, { color: colors.textTertiary }]}>REF: {parcel?.trackingCode || "N/A"}</Text>
          </View>
          <Text style={[styles.megaTitle, { color: colors.text }]}>VALIDER LA MISSION</Text>
        </View>

        {/* ─── SECTION 01: GÉOPOSITIONNEMENT ─── */}
        <View style={styles.section}>
          {renderSectionHeader("01", "Géopositionnement")}
          <View style={[styles.statusBox, {
            backgroundColor: location ? colors.success + "08" : (locationError ? colors.danger + "08" : (isDark ? "#0A0A0A" : "#F6F6F6")),
            borderColor: location ? colors.success : (locationError ? colors.danger : colors.border)
          }]}>
            {isLoadingLocation ? (
              <ActivityIndicator size="small" color={colors.accent} />
            ) : location ? (
              <Ionicons name="location-outline" size={24} color={colors.success} />
            ) : (
              <Ionicons name="alert-circle-outline" size={24} color={colors.danger} />
            )}
            <View style={{ flex: 1 }}>
              <Text style={[styles.statusTitle, { color: location ? colors.success : (locationError ? colors.danger : colors.textSecondary) }]}>
                {isLoadingLocation ? "ACQUISITION_SATELLITE..." : location ? "COORDONNÉES VERROUILLÉES" : "ERREUR_GPS"}
              </Text>
              {location && <Text style={[styles.coordsText, { color: colors.textTertiary }]}>{location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}</Text>}
            </View>
            {!isLoadingLocation && !location && (
              <Pressable onPress={requestLocation} style={styles.retryBtn}>
                <Ionicons name="refresh" size={18} color={colors.danger} />
              </Pressable>
            )}
          </View>
        </View>

        {/* ─── SECTION 02: VÉRIFICATION COLIS ─── */}
        <View style={styles.section}>
          {renderSectionHeader("02", "Vérification Colis")}
          <Text style={[styles.targetLabel, { color: colors.textTertiary }]}>SCAN_EXPECTED: {barcode}</Text>

          <View style={[styles.inputRow, {
            borderColor: barcodeMatch === true ? colors.success : (barcodeMatch === false ? colors.danger : colors.border),
            backgroundColor: isDark ? "#0A0A0A" : "#F6F6F6"
          }]}>
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              value={scannedCode}
              onChangeText={(t) => { setScannedCode(t); setBarcodeMatch(null); }}
              placeholder="SAISIE_MANUELLE_OU_SCAN..."
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="characters"
            />
            <Pressable onPress={handleVerify} style={[styles.verifyBtn, { backgroundColor: isDark ? colors.text : "#000" }]}>
              <Text style={[styles.verifyText, { color: isDark ? colors.background : "#FFF" }]}>VERIFIER</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={async () => {
              const { status } = await requestPermission();
              if (status === 'granted') setShowScanner(true);
            }}
            style={[styles.cameraBtn, { backgroundColor: isDark ? "#0A0A0A" : "#F6F6F6", borderColor: colors.border }]}
          >
            <Ionicons name="scan-outline" size={20} color={colors.text} />
            <Text style={[styles.cameraBtnText, { color: colors.text }]}>ACTIVER LE SCANNER OPTIQUE</Text>
          </Pressable>

          {showScanner && (
            <View style={styles.scannerOverlay}>
              <CameraView
                style={StyleSheet.absoluteFill}
                facing="back"
                enableTorch={torchEnabled}
                onBarcodeScanned={(res) => {
                  setScannedCode(res.data);
                  setShowScanner(false);
                  const match = res.data.trim().toUpperCase() === barcode?.trim().toUpperCase();
                  setBarcodeMatch(match);
                  if (match) Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                  else Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                }}
              />
              <View style={styles.scannerMask}>
                <View style={[styles.scanGuide, { borderColor: colors.accent }]} />
              </View>
              <Pressable onPress={() => setShowScanner(false)} style={styles.closeScanner}>
                <Ionicons name="close-circle" size={44} color="#FFF" />
              </Pressable>
            </View>
          )}
        </View>

        {/* ─── SECTION 03: PHOTO DE LIVRAISON ─── */}
        <View style={styles.section}>
          {renderSectionHeader("03", "Photo de Livraison")}
          <PhotoCapture
            onPhotoTaken={(capturedPhoto) => setPhoto(capturedPhoto)}
            disabled={!barcodeMatch}
          />
        </View>

        {/* ─── SECTION 04: SIGNATURE CLIENT ─── */}
        <View style={styles.section}>
          {renderSectionHeader("04", "Signature Client")}
          <SignatureCapture
            onSignatureCaptured={(capturedSignature) => setSignature(capturedSignature)}
            disabled={!barcodeMatch || !photo}
            recipientName={parcel?.recipient.name}
          />
        </View>
      </ScrollView>

      {/* ─── VALIDATION TERMINAL ─── */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 24, backgroundColor: colors.background }]}>
        <Pressable
          onPress={handleConfirm}
          disabled={!barcodeMatch || !location || !photo || !signature || isSubmitting}
          style={({ pressed }) => [
            styles.confirmBtn,
            {
              backgroundColor: (barcodeMatch && location && photo && signature) ? (isDark ? colors.text : "#000") : colors.border,
              opacity: pressed ? 0.8 : (isSubmitting || !barcodeMatch || !location || !photo || !signature ? 0.2 : 1),
            }
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator color={isDark ? colors.background : "#FFF"} />
          ) : (
            <>
              <Text style={[styles.confirmText, { color: isDark ? colors.background : "#FFF" }]}>VALIDER L'OPÉRATION</Text>
              <Ionicons name="checkmark-done-outline" size={20} color={isDark ? colors.background : "#FFF"} />
            </>
          )}
        </Pressable>
      </View>
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
    marginBottom: 32,
  },
  headerInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  liveIndicatorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
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
    fontSize: 28,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: -1,
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
  statusBox: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    gap: 16,
    borderWidth: 1,
  },
  statusTitle: {
    fontSize: 12,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 1,
  },
  coordsText: {
    fontSize: 10,
    fontFamily: typography.fontFamily.bold,
    marginTop: 2,
  },
  retryBtn: {
    padding: 8,
  },
  targetLabel: {
    fontSize: 10,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 1,
  },
  inputRow: {
    flexDirection: "row",
    borderWidth: 1,
    height: 64,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 20,
    fontSize: 14,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 2,
  },
  verifyBtn: {
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  verifyText: {
    fontSize: 10,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 1,
  },
  cameraBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 56,
    gap: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  cameraBtnText: {
    fontSize: 11,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 1,
  },
  scannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
    zIndex: 1000,
  },
  scannerMask: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  scanGuide: {
    width: "70%",
    height: 150,
    borderWidth: 2,
    borderStyle: "dashed",
  },
  closeScanner: {
    position: "absolute",
    bottom: 60,
    alignSelf: "center",
    zIndex: 1001,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  confirmBtn: {
    height: 72,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  confirmText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 2,
  }
});
