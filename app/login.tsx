import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/contexts/AuthContext";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function LoginScreen() {
  const { colors } = useAppTheme();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const webTopInset = Platform.OS === "web" ? 67 : 0;

  async function handleLogin() {
    setError("");
    if (!employeeId.trim()) {
      setError("Veuillez entrer votre identifiant");
      return;
    }
    if (password.length < 4) {
      setError("Mot de passe trop court (min. 4 caracteres)");
      return;
    }
    setIsSubmitting(true);
    try {
      await login({ employeeId: employeeId.trim(), password });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace("/(tabs)");
    } catch (e: any) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setError(e.message || "Erreur de connexion");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={90}
    >
      <View style={[styles.content, { paddingTop: insets.top + webTopInset + 40, paddingBottom: insets.bottom + 20 }]}>
        <View style={styles.logoContainer}>
          <View style={[styles.logoIcon, { backgroundColor: colors.primary }]}>
            <Ionicons name="cube" size={36} color="#fff" />
          </View>
          <Text style={[styles.appName, { color: colors.text }]}>KoliGo</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Gestion de livraison dernier kilometre
          </Text>
        </View>

        <View style={styles.form}>
          {!!error && (
            <View style={[styles.errorBox, { backgroundColor: colors.danger + "12" }]}>
              <Ionicons name="warning-outline" size={16} color={colors.danger} />
              <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Identifiant employe</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="id-card-outline" size={20} color={colors.textTertiary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={employeeId}
                onChangeText={setEmployeeId}
                placeholder="Ex: KLG-1001"
                placeholderTextColor={colors.textTertiary}
                autoCapitalize="characters"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Mot de passe</Text>
            <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.textTertiary} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={password}
                onChangeText={setPassword}
                placeholder="Votre mot de passe"
                placeholderTextColor={colors.textTertiary}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={10}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.textTertiary}
                />
              </Pressable>
            </View>
          </View>

          <Pressable
            onPress={handleLogin}
            disabled={isSubmitting}
            style={({ pressed }) => [
              styles.loginButton,
              {
                backgroundColor: colors.primary,
                opacity: pressed ? 0.9 : isSubmitting ? 0.7 : 1,
                transform: [{ scale: pressed ? 0.98 : 1 }],
              },
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="log-in-outline" size={20} color="#fff" />
                <Text style={styles.loginButtonText}>Se connecter</Text>
              </>
            )}
          </Pressable>

          <Text style={[styles.hint, { color: colors.textTertiary }]}>
            Demo: KLG-1001 / 1234
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
    gap: 8,
  },
  logoIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  appName: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  form: {
    gap: 16,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  errorText: {
    fontSize: 13,
    fontWeight: "500",
    flex: 1,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 52,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: "100%",
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    height: 52,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  hint: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 4,
  },
});
