import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Platform,
  Alert,
} from "react-native";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as ImagePicker from "expo-image-picker";
import * as Haptics from "expo-haptics";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useTournee } from "@/contexts/TourneeContext";
import { INCIDENT_LABELS } from "@/constants/labels";
import type { IncidentTypeValue, GeoCoordinates } from "../../shared/schema";
import { IncidentType } from "../../shared/schema";

export default function IncidentScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { getParcelById, reportIncident } = useTournee();
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
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          setLocation({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
        }
      } catch {}
    })();
  }, []);

  async function handleTakePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission requise", "L'acces a la camera est necessaire pour prendre une photo.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  }

  async function handleSubmit() {
    if (!selectedType) {
      Alert.alert("Erreur", "Veuillez selectionner un type d'incident");
      return;
    }
    if (!description.trim()) {
      Alert.alert("Erreur", "Veuillez decrire l'incident");
      return;
    }
    setIsSubmitting(true);
    try {
      await reportIncident(id, {
        type: selectedType,
        description: description.trim(),
        photoUri: photoUri || undefined,
        coordinates: location || undefined,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
      router.back();
    } catch (e: any) {
      Alert.alert("Erreur", e.message || "Erreur lors du signalement");
    } finally {
      setIsSubmitting(false);
    }
  }

  const incidentTypes = Object.entries(IncidentType) as [string, IncidentTypeValue][];

  const typeIcons: Record<IncidentTypeValue, keyof typeof Ionicons.glyphMap> = {
    absent: "person-remove-outline",
    damaged: "cube-outline",
    wrong_address: "location-outline",
    access_denied: "lock-closed-outline",
    other: "ellipsis-horizontal-circle-outline",
  };

  return (
    <>
      <Stack.Screen options={{ title: "Signaler un incident", headerBackTitle: "Retour" }} />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={{ paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 16) + 16 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Type d'incident</Text>
            <View style={styles.typeGrid}>
              {incidentTypes.map(([_, value]) => (
                <Pressable
                  key={value}
                  onPress={() => {
                    setSelectedType(value);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  style={[
                    styles.typeButton,
                    {
                      backgroundColor: selectedType === value ? colors.primary + "15" : colors.surface,
                      borderColor: selectedType === value ? colors.primary : colors.borderLight,
                    },
                  ]}
                >
                  <Ionicons
                    name={typeIcons[value]}
                    size={22}
                    color={selectedType === value ? colors.primary : colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.typeLabel,
                      { color: selectedType === value ? colors.primary : colors.textSecondary },
                    ]}
                  >
                    {INCIDENT_LABELS[value]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Description</Text>
            <TextInput
              style={[
                styles.textArea,
                { color: colors.text, backgroundColor: colors.surface, borderColor: colors.border },
              ]}
              value={description}
              onChangeText={setDescription}
              placeholder="Decrivez l'incident en detail..."
              placeholderTextColor={colors.textTertiary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Photo (optionnel)</Text>
            {photoUri ? (
              <View style={styles.photoPreview}>
                <View style={[styles.photoPlaceholder, { backgroundColor: colors.success + "15" }]}>
                  <Ionicons name="image" size={32} color={colors.success} />
                  <Text style={[styles.photoText, { color: colors.success }]}>Photo capturee</Text>
                </View>
                <Pressable onPress={() => setPhotoUri(null)} hitSlop={10}>
                  <Ionicons name="close-circle" size={24} color={colors.danger} />
                </Pressable>
              </View>
            ) : (
              <Pressable
                onPress={handleTakePhoto}
                style={[styles.photoButton, { borderColor: colors.border, backgroundColor: colors.surface }]}
              >
                <Ionicons name="camera-outline" size={28} color={colors.textSecondary} />
                <Text style={[styles.photoButtonText, { color: colors.textSecondary }]}>
                  Prendre une photo
                </Text>
              </Pressable>
            )}
          </View>

          {location && (
            <View style={[styles.locationRow, { backgroundColor: colors.info + "12" }]}>
              <Ionicons name="location" size={16} color={colors.info} />
              <Text style={[styles.locationText, { color: colors.info }]}>
                Position GPS enregistree
              </Text>
            </View>
          )}

          <Pressable
            onPress={handleSubmit}
            disabled={isSubmitting || !selectedType || !description.trim()}
            style={({ pressed }) => [
              styles.submitButton,
              {
                backgroundColor: selectedType && description.trim() ? colors.danger : colors.textTertiary,
                opacity: pressed ? 0.9 : isSubmitting ? 0.7 : 1,
              },
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="warning" size={20} color="#fff" />
                <Text style={styles.submitText}>Signaler l'incident</Text>
              </>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    gap: 20,
  },
  section: {
    gap: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  typeGrid: {
    gap: 8,
  },
  typeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    minHeight: 100,
    lineHeight: 22,
  },
  photoButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    gap: 8,
  },
  photoButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  photoPreview: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  photoPlaceholder: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 16,
    borderRadius: 12,
  },
  photoText: {
    fontSize: 14,
    fontWeight: "600",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  locationText: {
    fontSize: 13,
    fontWeight: "600",
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
});
