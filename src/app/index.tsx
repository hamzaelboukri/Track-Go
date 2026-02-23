import { Tabs } from 'expo-router';

export default function AppTabs() {
  return (
    <Tabs>
      <Tabs.Screen name="tournee" options={{ title: 'Tournée' }} />
      <Tabs.Screen name="map" options={{ title: 'Carte' }} />
      <Tabs.Screen name="performance" options={{ title: 'Performance' }} />
    </Tabs>
  );
}
