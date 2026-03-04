import { useState, useEffect, useCallback } from 'react';
import { locationService, type EnhancedLocation } from '@/services/location';

export function useDeliveryLocation() {
  const [location, setLocation] = useState<EnhancedLocation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const captureLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Vérifier si le GPS est activé
      const isEnabled = await locationService.isLocationEnabled();
      if (!isEnabled) {
        throw new Error('Services de localisation désactivés');
      }

      // Capturer la position
      const enhancedLocation = await locationService.captureDeliveryLocation();
      setLocation(enhancedLocation);

      // Avertir si la qualité est faible
      if (!enhancedLocation.quality.isGood) {
        console.warn('[GPS] Qualité faible:', enhancedLocation.quality.message);
      }

      return enhancedLocation;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erreur GPS inconnue';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Capture automatique au montage
  useEffect(() => {
    captureLocation();
  }, []);

  return {
    location,
    isLoading,
    error,
    captureLocation,
    quality: location?.quality,
  };
}
