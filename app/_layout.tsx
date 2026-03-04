import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useColorScheme } from "react-native";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { storageService } from "@/services/storage";
import Colors from "@/constants/colors";

import {
  useFonts,
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_600SemiBold,
  Outfit_700Bold,
  Outfit_800ExtraBold,
  Outfit_900Black
} from "@expo-google-fonts/outfit";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [onboardingChecked, setOnboardingChecked] = React.useState(false);

  const [fontsLoaded] = useFonts({
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_600SemiBold,
    Outfit_700Bold,
    Outfit_800ExtraBold,
    Outfit_900Black,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    const checkOnboarding = async () => {
      const completed = await storageService.isOnboardingCompleted();
      setOnboardingChecked(true);

      if (!completed && segments[0] !== "onboarding") {
        console.log("First time user, redirecting to onboarding...");
        router.replace("/onboarding");
      }
    };

    checkOnboarding();
  }, [router, segments]);

  useEffect(() => {
    // Wait for everything to be ready
    if (authLoading || !onboardingChecked || !fontsLoaded) return;

    const inAuthGroup = segments[0] === "(tabs)" || segments[0] === "parcel";
    const inOnboarding = segments[0] === "onboarding";

    console.log("Navigation check:", { isAuthenticated, inAuthGroup, segments });

    if (inOnboarding) return; // Don't redirect if on onboarding

    if (!isAuthenticated && inAuthGroup) {
      // Redirect to login if not authenticated
      console.log("Redirecting to login...");
      router.replace("/login");
    } else if (isAuthenticated && !inAuthGroup) {
      // Redirect to tabs if authenticated
      console.log("Redirecting to tabs...");
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, authLoading, segments, router, onboardingChecked]);

  return (
    <Stack screenOptions={{ headerBackTitle: "Retour" }}>
      <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      <Stack.Screen name="login" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="parcel" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const appColors = isDark ? Colors.dark : Colors.light;

  const navigationTheme = React.useMemo(() => {
    const base = isDark ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: appColors.primary,
        background: appColors.background,
        card: appColors.surface,
        text: appColors.text,
        border: appColors.border,
        notification: appColors.accent,
      },
    };
  }, [isDark, appColors]);

  useEffect(() => {
    console.log("RootLayout mounted");
  }, []);

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(appColors.background).catch(() => { });
  }, [appColors.background]);

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <KeyboardProvider>
              <AuthProvider>
                <RootLayoutNav />
              </AuthProvider>
            </KeyboardProvider>
          </GestureHandlerRootView>
        </QueryClientProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
}
