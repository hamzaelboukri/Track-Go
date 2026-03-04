import * as Location from 'expo-location';
import * as TaskManager from 'expo-task-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const BACKGROUND_LOCATION_TASK = 'background-location-task';
const API_ENDPOINT = process.env.EXPO_PUBLIC_DOMAIN + '/api/location/track';

// Définir la tâche background (DOIT être au niveau module, pas dans une fonction)
// Seulement sur native (pas web)
if (Platform.OS !== 'web') {
  TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }) => {
    if (error) {
      console.error('[Background Location] Error:', error.message);
      return;
    }

    if (data) {
      const { locations } = data as { locations: Location.LocationObject[] };
      console.log('[Background Location] Received', locations.length, 'locations');

      try {
        for (const location of locations) {
          await processLocation(location);
        }
      } catch (err) {
        console.error('[Background Location] Processing error:', err);
      }
    }
  });
}

async function processLocation(location: Location.LocationObject) {
  const payload = {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    accuracy: location.coords.accuracy,
    altitude: location.coords.altitude,
    heading: location.coords.heading,
    speed: location.coords.speed,
    timestamp: location.timestamp,
  };

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.status}`);
    }

    console.log('[Background Location] Sent to server');
  } catch (error) {
    console.error('[Background Location] Failed to send, storing locally');
    const key = `pending_location_${Date.now()}`;
    await AsyncStorage.setItem(key, JSON.stringify(payload));
  }
}

export const backgroundLocationService = {
  async isTracking(): Promise<boolean> {
    if (Platform.OS === 'web') {
      return false;
    }
    return await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
  },

  async startTracking(): Promise<{ success: boolean; error?: string }> {
    if (Platform.OS === 'web') {
      return { success: false, error: 'Background tracking non disponible sur web' };
    }
    try {
      const { status: foregroundStatus } = await Location.getForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        return { success: false, error: 'Permission foreground requise' };
      }

      const { status: backgroundStatus } = await Location.getBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        return { success: false, error: 'Permission background requise' };
      }

      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
      if (isRegistered) {
        console.log('[Background Location] Already tracking');
        return { success: true };
      }

      await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
        accuracy: Location.Accuracy.Balanced,
        timeInterval: 60000,
        distanceInterval: 100,
        deferredUpdatesInterval: 300000,
        deferredUpdatesDistance: 500,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: 'KoliGo - Tournée Active',
          notificationBody: 'Suivi de votre position pour optimiser les livraisons',
          notificationColor: '#06C167',
        },
      });

      console.log('[Background Location] Started successfully');
      return { success: true };
    } catch (error) {
      console.error('[Background Location] Start error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue' 
      };
    }
  },

  async stopTracking(): Promise<void> {
    try {
      const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
      if (isRegistered) {
        await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
        console.log('[Background Location] Stopped successfully');
      }
    } catch (error) {
      console.error('[Background Location] Stop error:', error);
    }
  },

  async syncPendingLocations(): Promise<number> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const pendingKeys = keys.filter(k => k.startsWith('pending_location_'));
      
      let synced = 0;
      for (const key of pendingKeys) {
        const locationData = await AsyncStorage.getItem(key);
        if (!locationData) continue;

        try {
          const response = await fetch(API_ENDPOINT, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: locationData,
          });

          if (response.ok) {
            await AsyncStorage.removeItem(key);
            synced++;
          }
        } catch (err) {
          // Garder pour plus tard
        }
      }

      console.log(`[Background Location] Synced ${synced}/${pendingKeys.length} pending locations`);
      return synced;
    } catch (error) {
      console.error('[Background Location] Sync error:', error);
      return 0;
    }
  },

  async getPendingCount(): Promise<number> {
    const keys = await AsyncStorage.getAllKeys();
    return keys.filter(k => k.startsWith('pending_location_')).length;
  },
};
