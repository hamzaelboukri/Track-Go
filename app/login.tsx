import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeInDown,
} from "react-native-reanimated";
import { useAuth } from "@/contexts/AuthContext";
import { useAppTheme } from "@/hooks/useAppTheme";
import { typography } from "@/constants/typography";

export default function LoginScreen() {
  const { colors, isDark } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({
    transform: [{ scale: btnScale.value }],
  }));

  async function handleLogin() {
    setError("");
    if (!employeeId.trim()) { setError("IDENTIFIANT REQUIS"); return; }
    if (password.length < 4) { setError("MOT DE PASSE TROP COURT"); return; }
    setIsSubmitting(true);
    btnScale.value = withSpring(0.96);
    try {
      await login({ employeeId: employeeId.trim(), password });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(e.message || "ERREUR DE CONNEXION");
    } finally {
      setIsSubmitting(false);
      btnScale.value = withSpring(1);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* ─── CREATIVE BACKGROUND GRID ─── */}
      <View style={styles.backgroundGrid}>
        {Array.from({ length: 12 }).map((_, i) => (
          <View key={i} style={[styles.gridLine, { left: `${(i + 1) * 10}%`, backgroundColor: isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)" }]} />
        ))}
      </View>

      <View style={[styles.content, { paddingTop: insets.top + (Platform.OS === 'web' ? 40 : 60) }]}>

        {/* ─── DUAL LOGO SYSTEM (Creative & Professional) ─── */}
        <View style={styles.brandHero}>
          <View style={[styles.appIconFrame, { borderColor: isDark ? colors.text : "#000" }]}>
            <Image
              source={require("@/assets/images/icon.png")}
              style={styles.mainLogo}
              contentFit="contain"
            />
          </View>
          <View style={styles.brandInfo}>
            <Text style={[styles.brandLarge, { color: colors.text }]}>KOLIGO</Text>
            <View style={[styles.tagContainer, { backgroundColor: colors.accent }]}>
            </View>
          </View>
        </View>

        {/* ─── CREATIVE LAYERED HEADING ─── */}
        <Animated.View entering={FadeInDown.delay(200).duration(800)} style={styles.headingSection}>
          <View style={styles.headingRow}>
            <Text style={[styles.mainHeading, { color: colors.text }]}>ACCÈS AU{"\n"}<Text style={{ color: colors.accent }}>SYSTÈME</Text></Text>
          </View>
          <Text style={[styles.subText, { color: colors.textSecondary }]}>
            Authentification requise pour charger le manifeste de livraison et activer le traçage GPS haute précision.
          </Text>
        </Animated.View>

        {/* ─── INDUSTRIAL FORM ─── */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <View style={[styles.inputField, { borderLeftColor: colors.accent }]}>
              <Text style={[styles.inputLabel, { color: colors.textTertiary }]}>MATRICULE CONDUCTEUR</Text>
              <View style={styles.inputRow}>
                <Ionicons name="barcode-outline" size={20} color={colors.textSecondary} />
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  value={employeeId}
                  onChangeText={setEmployeeId}
                  placeholder="KLG-1522"
                  placeholderTextColor={colors.textTertiary}
                  autoCapitalize="characters"
                />
              </View>
            </View>

            <View style={[styles.inputField, { borderLeftColor: colors.accent }]}>
              <Text style={[styles.inputLabel, { color: colors.textTertiary }]}>CLEF D'ACCÈS RÉSEAU</Text>
              <View style={styles.inputRow}>
                <Ionicons name="key-outline" size={20} color={colors.textSecondary} />
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textTertiary}
                  secureTextEntry={!showPassword}
                />
                <Pressable onPress={() => setShowPassword(!showPassword)}>
                  <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={colors.textTertiary} />
                </Pressable>
              </View>
            </View>
          </View>

          {!!error && <Text style={styles.errorText}>⚠ ERROR: {error}</Text>}

          <Animated.View style={btnStyle}>
            <Pressable
              onPress={handleLogin}
              disabled={isSubmitting}
              style={({ pressed }) => [
                styles.submitBtn,
                { backgroundColor: isDark ? colors.text : "#000", opacity: pressed ? 0.9 : 1 }
              ]}
            >
              {isSubmitting ? (
                <ActivityIndicator color={isDark ? "#000" : "#FFF"} />
              ) : (
                <>
                  <Text style={[styles.submitText, { color: isDark ? "#000" : "#FFF" }]}>CONNECTEZ</Text>
                  <Ionicons name="chevron-forward" size={20} color={isDark ? "#000" : "#FFF"} />
                </>
              )}
            </Pressable>
          </Animated.View>
        </View>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backgroundGrid: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
  },
  gridLine: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 1,
  },
  content: { flex: 1, paddingHorizontal: 32 },

  brandHero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20,
    marginBottom: 60,
  },
  appIconFrame: {
    width: 72,
    height: 72,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderRadius: 0,
  },
  mainLogo: {
    width: 58,
    height: 58,
  },
  brandInfo: { gap: 4 },
  brandLarge: {
    fontSize: 24,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: -1,
  },
  tagContainer: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },

  headingSection: {
    marginBottom: 48,
    gap: 12,
  },
  headingRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  mainHeading: {
    fontSize: 52,
    fontFamily: typography.fontFamily.bold,
    lineHeight: 54,
    letterSpacing: -2,
  },
  subText: {
    fontSize: 15,
    fontFamily: typography.fontFamily.medium,
    lineHeight: 22,
    paddingRight: 10,
  },

  form: { gap: 32 },
  inputGroup: { gap: 20 },
  inputField: {
    borderLeftWidth: 4,
    paddingLeft: 16,
    paddingVertical: 4,
    gap: 8,
  },
  inputLabel: {
    fontSize: 9,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 2,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 1,
  },
  errorText: {
    color: "#E11900",
    fontSize: 11,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 1,
  },

  submitBtn: {
    height: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  submitText: {
    fontSize: 13,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 1.5,
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 32,
    right: 32,
    alignItems: "center",
  },
});
