import { Stack } from "expo-router";
import React from "react";

export default function ParcelLayout() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Retour" }}>
      <Stack.Screen name="[id]" options={{ title: "Detail colis" }} />
      <Stack.Screen name="deliver" options={{ title: "Valider livraison" }} />
      <Stack.Screen name="incident" options={{ title: "Signaler incident" }} />
    </Stack>
  );
}
