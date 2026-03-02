import { QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { storageService } from "@/services/storage";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [onboardingChecked, setOnboardingChecked] = React.useState(false);

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
    if (isLoading || !onboardingChecked) return;

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
  }, [isAuthenticated, isLoading, segments, router, onboardingChecked]);

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
  useEffect(() => {
    console.log("RootLayout mounted");
    const timer = setTimeout(() => {
      console.log("Hiding splash screen");
      SplashScreen.hideAsync();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
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
  );
}
