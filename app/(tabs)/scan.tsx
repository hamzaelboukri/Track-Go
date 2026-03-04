import React, { useState, useRef, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, Pressable, Platform, TextInput, ScrollView, StatusBar } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { CameraView, useCameraPermissions, type BarcodeScanningResult } from "expo-camera";
import { useAppTheme } from "@/hooks/useAppTheme";
import { typography } from "@/constants/typography";
import { useTournee } from "@/contexts/TourneeContext";

export default function ScanScreen() {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { tour, stats } = useTournee();
  const [manualCode, setManualCode] = useState("");
  const [error, setError] = useState("");
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [scanLocked, setScanLocked] = useState(false);
  const [permission, requestPermission] = useCameraPermissions();
  const unlockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const webTopInset = Platform.select({ web: 67, default: 0 });

  function findParcelByBarcode(barcode: string) {
    return tour?.parcels.find(
      (p) => p.barcode === barcode || p.trackingCode === barcode
    );
  }

  function handleManualSubmit() {
    setError("");
    const code = manualCode.trim().toUpperCase();
    if (!code) { setError("CODE MANQUANT"); return; }
    const parcel = findParcelByBarcode(code);
    if (parcel) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setManualCode("");
      router.push({ pathname: "/parcel/[id]", params: { id: parcel.id } });
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(`"${code}" NON RECONNU`);
    }
  }

  const unlockScanner = useCallback((delay = 1200) => {
    if (unlockTimeoutRef.current) clearTimeout(unlockTimeoutRef.current);
    unlockTimeoutRef.current = setTimeout(() => setScanLocked(false), delay);
  }, []);

  function processCode(code: string) {
    const normalized = code.trim().toUpperCase();
    if (!normalized) return;
    setManualCode(normalized);
    setError("");
    setScanLocked(true);

    const parcel = findParcelByBarcode(normalized);
    if (parcel) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.push({ pathname: "/parcel/[id]", params: { id: parcel.id } });
      unlockScanner(1600);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    setError(`"${normalized}" NON RECONNU`);
    unlockScanner();
  }

  function handleBarcodeScanned(result: BarcodeScanningResult) {
    if (scanLocked) return;
    processCode(result.data);
  }

  useEffect(() => {
    return () => { if (unlockTimeoutRef.current) clearTimeout(unlockTimeoutRef.current); };
  }, []);

  const isWeb = Platform.OS === "web";
  const hasCamera = !isWeb && permission?.granted;

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
      >
        {/* ─── TACTICAL HEADER ─── */}
        <View style={styles.terminalHeader}>
          <Text style={[styles.megaTitle, { color: colors.text }]}>SCANNER COLIS</Text>
          <View style={[styles.statsBracket, { borderColor: colors.border }]}>
            <Text style={[styles.statsText, { color: colors.textSecondary }]}>
              {stats?.pending || 0} MISSIONS RESTANTES
            </Text>
          </View>
        </View>

        {/* ─── SECTION 01: CAPTURE VISUELLE ─── */}
        <View style={styles.section}>
          {renderSectionHeader("01", "Capture Visuelle")}
          <View style={[styles.viewportWrapper, { borderColor: colors.border, backgroundColor: isDark ? "#0A0A0A" : "#F6F6F6" }]}>
            {hasCamera ? (
              <CameraView
                style={styles.camera}
                facing="back"
                enableTorch={torchEnabled}
                barcodeScannerSettings={{
                  barcodeTypes: ["ean13", "code128", "qr", "pdf417"],
                }}
                onBarcodeScanned={handleBarcodeScanned}
              >
                <View style={styles.cameraOverlay}>
                  <View style={[styles.scanGuide, { borderColor: colors.accent }]} />
                </View>
              </CameraView>
            ) : (
              <View style={styles.noCamera}>
                <Ionicons name="scan-outline" size={48} color={colors.textTertiary} />
                <Text style={[styles.noCameraText, { color: colors.textSecondary }]}>
                  {isWeb ? "INTERFACE LIMITÉE SUR WEB" : "ACCÈS CAMÉRA REQUIS"}
                </Text>
                {!isWeb && (
                  <Pressable
                    onPress={requestPermission}
                    style={[styles.grantBtn, { backgroundColor: colors.text }]}
                  >
                    <Text style={[styles.grantBtnText, { color: colors.background }]}>ACTIVER LE CAPTEUR</Text>
                  </Pressable>
                )}
              </View>
            )}
            {/* Tactical Corners */}
            <View style={[styles.cornerTL, { borderTopColor: colors.accent, borderLeftColor: colors.accent }]} />
            <View style={[styles.cornerBR, { borderBottomColor: colors.accent, borderRightColor: colors.accent }]} />
          </View>

          <View style={styles.viewportActions}>
            <Pressable
              onPress={() => setTorchEnabled(!torchEnabled)}
              style={[styles.actionBtn, { backgroundColor: isDark ? "#0A0A0A" : "#F6F6F6", borderColor: colors.border }]}
            >
              <Ionicons name={torchEnabled ? "flash" : "flash-off-outline"} size={18} color={torchEnabled ? colors.accentWarm : colors.text} />
              <Text style={[styles.actionBtnText, { color: colors.text }]}>LUMIÈRE</Text>
            </Pressable>
            <Pressable
              onPress={() => { setScanLocked(false); setError(""); }}
              style={[styles.actionBtn, { backgroundColor: isDark ? "#0A0A0A" : "#F6F6F6", borderColor: colors.border }]}
            >
              <Ionicons name="refresh-outline" size={18} color={colors.text} />
              <Text style={[styles.actionBtnText, { color: colors.text }]}>RESET</Text>
            </Pressable>
          </View>
        </View>

        {/* ─── SECTION 02: ENTRÉE MANUELLE ─── */}
        <View style={styles.section}>
          {renderSectionHeader("02", "Entrée Manuelle")}
          <View style={[styles.inputContainer, { backgroundColor: isDark ? "#0A0A0A" : "#F6F6F6", borderColor: colors.border }]}>
            <TextInput
              style={[styles.manualInput, { color: colors.text }]}
              value={manualCode}
              onChangeText={(t) => { setManualCode(t); setError(""); }}
              placeholder="TRACKING_ID"
              placeholderTextColor={colors.textTertiary}
              autoCapitalize="characters"
              returnKeyType="send"
              onSubmitEditing={handleManualSubmit}
            />
            <Pressable onPress={handleManualSubmit} style={[styles.submitBtn, { backgroundColor: isDark ? colors.text : "#000" }]}>
              <Ionicons name="arrow-forward" size={18} color={isDark ? colors.background : "#FFF"} />
            </Pressable>
          </View>
          {!!error && (
            <View style={[styles.errorBox, { backgroundColor: colors.danger + "10" }]}>
              <Ionicons name="alert-circle" size={14} color={colors.danger} />
              <Text style={[styles.errorText, { color: colors.danger }]}>{error.toUpperCase()}</Text>
            </View>
          )}
        </View>

      </ScrollView>
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
  viewportWrapper: {
    width: "100%",
    height: 340,
    borderWidth: 1,
    position: "relative",
    overflow: "hidden",
  },
  camera: { flex: 1 },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  scanGuide: {
    width: "70%",
    height: 150,
    borderWidth: 2,
    borderStyle: "dashed",
    opacity: 0.8,
  },
  noCamera: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
    padding: 24,
  },
  noCameraText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.bold,
    textAlign: "center",
    letterSpacing: 1,
  },
  grantBtn: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  grantBtnText: {
    fontSize: 10,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 1,
  },
  cornerTL: {
    position: "absolute",
    top: 0,
    left: 0,
    width: 20,
    height: 20,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  cornerBR: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  viewportActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 1,
  },
  actionBtnText: {
    fontSize: 11,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 1,
  },
  inputContainer: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    paddingLeft: 20,
    paddingRight: 8,
  },
  manualInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 2,
  },
  submitBtn: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 12,
    justifyContent: "center",
  },
  errorText: {
    fontSize: 10,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 1,
  },
});
