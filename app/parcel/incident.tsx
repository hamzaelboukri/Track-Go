import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, ActivityIndicator, Platform, Alert } from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useTournee } from "@/contexts/TourneeContext";
import { INCIDENT_LABELS } from "@/constants/labels";
import { IncidentType, type IncidentTypeValue, type GeoCoordinates } from "../../shared/schema";
import { typography } from "@/constants/typography";

export default function IncidentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { reportIncident, getParcelById } = useTournee();
  const parcel = getParcelById(id);

  const [selectedType, setSelectedType] = useState<IncidentTypeValue | null>(null);
  const [description, setDescription] = useState("");
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [location, setLocation] = useState<GeoCoordinates | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        }
      } catch { }
    })();
  }, []);

  async function handleTakePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("PERMISSION REQUISE", "L'ACCÈS APPAREIL PHOTO EST NÉCESSAIRE");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.7 });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  async function handleSubmit() {
    if (!selectedType) { Alert.alert("ERREUR", "SÉLECTIONNEZ UN TYPE"); return; }
    if (!description.trim()) { Alert.alert("ERREUR", "DÉCRIVEZ L'INCIDENT"); return; }
    setIsSubmitting(true);
    try {
      await reportIncident(id, {
        type: selectedType,
        description: description.trim(),
        photoUri: photoUri || undefined,
        coordinates: location || undefined,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.dismiss(2);
    } catch (e: any) {
      Alert.alert("ERREUR", e.message || "ÉCHEC DU SIGNALEMENT");
    } finally {
      setIsSubmitting(false);
    }
  }

  const incidentTypes = Object.entries(IncidentType) as [string, IncidentTypeValue][];

  const renderSectionHeader = (num: string, title: string) => (
    <View style={styles.sectionHeader}>
      <Text style={[styles.sectionNum, { color: colors.accent }]}>{num}</Text>
      <Text style={[styles.sectionTitleText, { color: colors.textTertiary }]}>{title.toUpperCase()}</Text>
      <View style={[styles.sectionLine, { backgroundColor: colors.border }]} />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{
        title: "SIGNALEMENT D'ANOMALIE",
        headerTitleStyle: { fontFamily: typography.fontFamily.bold, fontSize: 12 },
        headerShadowVisible: false,
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerLeft: () => (
          <Pressable onPress={() => router.back()} style={{ marginLeft: 8 }}>
            <Ionicons name="close" size={24} color={colors.text} />
          </Pressable>
        )
      }} />

      {/* BACKGROUND DECORATION */}
      <View style={styles.backgroundDecoration}>
        {Array.from({ length: 10 }).map((_, i) => (
          <View key={i} style={[styles.bgLine, { left: `${(i + 1) * 10}%`, backgroundColor: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }]} />
        ))}
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 150, paddingHorizontal: 24, paddingTop: 20 }}>

        {/* ─── TECHNICAL HEADER BLOCK ─── */}
        <View style={styles.terminalHeader}>
          <View style={styles.headerInfoRow}>
            <View style={styles.liveIndicatorRow}>
              <View style={[styles.pulsingLight, { backgroundColor: colors.danger }]} />
              <Text style={[styles.liveTag, { color: colors.danger }]}>LOG_INCIDENT_ACTIVE</Text>
            </View>
            <Text style={[styles.terminalId, { color: colors.textTertiary }]}>REF: {parcel?.trackingCode || "N/A"}</Text>
          </View>
          <Text style={[styles.megaTitle, { color: colors.text }]}>SIGNALER L'INCIDENT</Text>
        </View>

        {/* ─── SECTION 01: TYPE D'ANOMALIE ─── */}
        <View style={styles.section}>
          {renderSectionHeader("01", "Type d'Anomalie")}
          <View style={styles.grid}>
            {incidentTypes.map(([_, value]) => (
              <Pressable
                key={value}
                onPress={() => {
                  setSelectedType(value);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={[
                  styles.gridItem,
                  {
                    backgroundColor: selectedType === value ? colors.danger : (isDark ? "#0A0A0A" : "#F6F6F6"),
                    borderColor: selectedType === value ? colors.danger : colors.border,
                    borderWidth: 1,
                  },
                ]}
              >
                <Ionicons
                  name={getIcon(value)}
                  size={24}
                  color={selectedType === value ? "#FFF" : colors.text}
                />
                <Text
                  style={[
                    styles.itemLabel,
                    { color: selectedType === value ? "#FFF" : colors.text },
                  ]}
                >
                  {INCIDENT_LABELS[value].toUpperCase()}
                </Text>
                {selectedType === value && <View style={styles.checkMark}><Ionicons name="checkmark" size={12} color="#FFF" /></View>}
              </Pressable>
            ))}
          </View>
        </View>

        {/* ─── SECTION 02: RAPPORT DÉTAILLÉ ─── */}
        <View style={styles.section}>
          {renderSectionHeader("02", "Rapport Détaillé")}
          <TextInput
            style={[styles.textArea, { color: colors.text, backgroundColor: isDark ? "#0A0A0A" : "#F6F6F6", borderColor: colors.border }]}
            value={description}
            onChangeText={setDescription}
            placeholder="DÉTAILLER L'ÉVÉNEMENT ICI..."
            placeholderTextColor={colors.textTertiary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* ─── SECTION 03: DOCUMENTATION VISUELLE ─── */}
        <View style={styles.section}>
          {renderSectionHeader("03", "Documentation Visuelle")}
          <Pressable
            onPress={handleTakePhoto}
            style={[styles.photoBtn, {
              backgroundColor: photoUri ? colors.success + "08" : (isDark ? "#0A0A0A" : "#F6F6F6"),
              borderColor: photoUri ? colors.success : colors.border,
              borderWidth: 1,
              borderStyle: photoUri ? 'solid' : 'dashed'
            }]}
          >
            {photoUri ? (
              <View style={styles.photoInfo}>
                <Ionicons name="checkmark-circle-outline" size={28} color={colors.success} />
                <View>
                  <Text style={[styles.photoText, { color: colors.success }]}>DOCUMENT_JOINT.JPG</Text>
                  <Text style={[styles.photoSubText, { color: colors.textTertiary }]}>PRÊT POUR TRANSMISSION</Text>
                </View>
                <Pressable onPress={() => setPhotoUri(null)} style={styles.removePhoto}>
                  <Ionicons name="trash-outline" size={20} color={colors.danger} />
                </Pressable>
              </View>
            ) : (
              <View style={styles.photoPlaceholder}>
                <Ionicons name="camera-outline" size={32} color={colors.textTertiary} />
                <Text style={[styles.photoPlaceholderText, { color: colors.textTertiary }]}>CLICHÉ OPÉRATIONNEL</Text>
              </View>
            )}
          </Pressable>
        </View>
      </ScrollView>

      {/* ─── TRANSMISSION TERMINAL ─── */}
      <View style={[styles.footer, { paddingBottom: insets.bottom + 24, backgroundColor: colors.background }]}>
        <Pressable
          onPress={handleSubmit}
          disabled={isSubmitting || !selectedType || !description.trim()}
          style={({ pressed }) => [
            styles.submitBtn,
            {
              backgroundColor: isDark ? colors.text : "#000",
              opacity: pressed ? 0.8 : (isSubmitting || !selectedType || !description.trim() ? 0.2 : 1),
            },
          ]}
        >
          {isSubmitting ? (
            <ActivityIndicator color={isDark ? colors.background : "#FFF"} />
          ) : (
            <>
              <Text style={[styles.submitText, { color: isDark ? colors.background : "#FFF" }]}>TRANSMETTRE LE RAPPORT</Text>
              <Ionicons name="shield-checkmark-outline" size={20} color={isDark ? colors.background : "#FFF"} />
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

function getIcon(value: IncidentTypeValue): keyof typeof Ionicons.glyphMap {
  switch (value) {
    case 'absent': return 'person-remove-outline';
    case 'damaged': return 'cube-outline';
    case 'wrong_address': return 'map-outline';
    case 'access_denied': return 'lock-closed-outline';
    default: return 'help-circle-outline';
  }
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
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  gridItem: {
    width: "48%",
    height: 110,
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    position: "relative",
  },
  checkMark: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  itemLabel: {
    fontSize: 10,
    fontFamily: typography.fontFamily.bold,
    textAlign: "center",
    letterSpacing: 0.5,
  },
  textArea: {
    padding: 20,
    fontSize: 14,
    fontFamily: typography.fontFamily.medium,
    minHeight: 120,
    borderWidth: 1,
  },
  photoBtn: {
    height: 100,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  photoPlaceholder: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  photoPlaceholderText: {
    fontSize: 12,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 1,
  },
  photoInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  photoText: {
    fontSize: 13,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 0.5,
  },
  photoSubText: {
    fontSize: 10,
    fontFamily: typography.fontFamily.medium,
  },
  removePhoto: {
    marginLeft: 'auto',
    padding: 8,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
  },
  submitBtn: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  submitText: {
    fontSize: 14,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 2,
  },
});
