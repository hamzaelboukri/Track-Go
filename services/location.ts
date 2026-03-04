import * as Location from 'expo-location';

export interface GPSQuality {
  isGood: boolean;
  accuracy: number;
  message: string;
  level: 'excellent' | 'good' | 'fair' | 'poor';
}

export interface EnhancedLocation {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude: number | null;
    speed: number | null;
    heading: number | null;
  };
  timestamp: number;
  quality: GPSQuality;
}

const GPS_CONFIG = {
  maxRetries: 3,
  timeout: 15000,
  minAccuracy: 20,
  retryDelay: 2000,
  accuracyThresholds: {
    excellent: 10,
    good: 20,
    fair: 50,
    poor: 100,
  },
};

class LocationService {
  /**
   * Évalue la qualité du signal GPS
   */
  private evaluateGPSQuality(accuracy: number | null): GPSQuality {
    if (!accuracy) {
      return {
        isGood: false,
        accuracy: 0,
        message: 'Précision GPS indisponible',
        level: 'poor',
      };
    }

    if (accuracy <= GPS_CONFIG.accuracyThresholds.excellent) {
      return {
        isGood: true,
        accuracy,
        message: `Signal GPS excellent (±${accuracy.toFixed(1)}m)`,
        level: 'excellent',
      };
    }

    if (accuracy <= GPS_CONFIG.accuracyThresholds.good) {
      return {
        isGood: true,
        accuracy,
        message: `Signal GPS bon (±${accuracy.toFixed(1)}m)`,
        level: 'good',
      };
    }

    if (accuracy <= GPS_CONFIG.accuracyThresholds.fair) {
      return {
        isGood: false,
        accuracy,
        message: `Signal GPS moyen (±${accuracy.toFixed(1)}m)`,
        level: 'fair',
      };
    }

    return {
      isGood: false,
      accuracy,
      message: `Signal GPS faible (±${accuracy.toFixed(1)}m)`,
      level: 'poor',
    };
  }

  /**
   * Capture la position GPS avec retry et validation
   */
  async captureDeliveryLocation(): Promise<EnhancedLocation> {
    // 1. Vérifier les permissions
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission GPS refusée');
    }

    let lastError: Error | null = null;
    let bestLocation: Location.LocationObject | null = null;
    let bestAccuracy = Infinity;

    // 2. Tentatives multiples avec amélioration progressive
    for (let attempt = 1; attempt <= GPS_CONFIG.maxRetries; attempt++) {
      try {
        console.log(`[GPS] Tentative ${attempt}/${GPS_CONFIG.maxRetries}...`);

        const location = await Promise.race([
          Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.BestForNavigation,
          }),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout GPS')), GPS_CONFIG.timeout)
          ),
        ]);

        const accuracy = location.coords.accuracy || Infinity;

        // Garder la meilleure position
        if (accuracy < bestAccuracy) {
          bestLocation = location;
          bestAccuracy = accuracy;
        }

        // Si la précision est suffisante, on arrête
        if (accuracy <= GPS_CONFIG.minAccuracy) {
          console.log(`[GPS] Position acquise avec précision ${accuracy.toFixed(1)}m`);
          break;
        }

        // Sinon, on attend avant de réessayer
        if (attempt < GPS_CONFIG.maxRetries) {
          console.log(`[GPS] Précision insuffisante (${accuracy.toFixed(1)}m), nouvelle tentative...`);
          await new Promise(resolve => setTimeout(resolve, GPS_CONFIG.retryDelay));
        }
      } catch (error) {
        lastError = error as Error;
        console.error(`[GPS] Erreur tentative ${attempt}:`, error);

        if (attempt < GPS_CONFIG.maxRetries) {
          await new Promise(resolve => setTimeout(resolve, GPS_CONFIG.retryDelay));
        }
      }
    }

    // 3. Vérifier si on a une position utilisable
    if (!bestLocation) {
      throw new Error(
        lastError?.message || 'Impossible d\'obtenir la position GPS'
      );
    }

    // 4. Évaluer la qualité
    const quality = this.evaluateGPSQuality(bestLocation.coords.accuracy);

    // 5. Retourner la position enrichie
    return {
      coords: {
        latitude: bestLocation.coords.latitude,
        longitude: bestLocation.coords.longitude,
        accuracy: bestLocation.coords.accuracy || 0,
        altitude: bestLocation.coords.altitude,
        speed: bestLocation.coords.speed,
        heading: bestLocation.coords.heading,
      },
      timestamp: bestLocation.timestamp,
      quality,
    };
  }

  /**
   * Obtient la dernière position connue (fallback)
   */
  async getLastKnownLocation(): Promise<Location.LocationObject | null> {
    try {
      return await Location.getLastKnownPositionAsync({
        maxAge: 60000, // 1 minute
        requiredAccuracy: 100,
      });
    } catch {
      return null;
    }
  }

  /**
   * Vérifie si les services de localisation sont activés
   */
  async isLocationEnabled(): Promise<boolean> {
    return await Location.hasServicesEnabledAsync();
  }
}

export const locationService = new LocationService();
