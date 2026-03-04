import { useState, useEffect, useRef, useCallback } from 'react';
import * as Location from 'expo-location';

export interface DriverLocation {
  latitude: number;
  longitude: number;
  heading: number | null;
  speed: number | null;
  accuracy: number;
  timestamp: number;
}

interface TrackingConfig {
  enabled: boolean;
  accuracy: Location.LocationAccuracy;
  timeInterval: number;
  distanceInterval: number;
}

export function useDriverLocationTracking(config: TrackingConfig) {
  const [location, setLocation] = useState<DriverLocation | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const previousLocationRef = useRef<DriverLocation | null>(null);

  const calculateHeading = useCallback((
    prev: DriverLocation,
    current: { latitude: number; longitude: number }
  ): number => {
    const lat1 = prev.latitude * Math.PI / 180;
    const lat2 = current.latitude * Math.PI / 180;
    const dLon = (current.longitude - prev.longitude) * Math.PI / 180;
    
    const y = Math.sin(dLon) * Math.cos(lat2);
    const x = Math.cos(lat1) * Math.sin(lat2) -
              Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);
    
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  }, []);

  const startTracking = useCallback(async () => {
    try {
      // Vérifier les permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission de localisation refusée');
        return;
      }

      // Obtenir la position initiale
      const initialLocation = await Location.getCurrentPositionAsync({
        accuracy: config.accuracy,
      });

      const initialDriverLocation: DriverLocation = {
        latitude: initialLocation.coords.latitude,
        longitude: initialLocation.coords.longitude,
        heading: initialLocation.coords.heading,
        speed: initialLocation.coords.speed,
        accuracy: initialLocation.coords.accuracy || 0,
        timestamp: initialLocation.timestamp,
      };

      setLocation(initialDriverLocation);
      previousLocationRef.current = initialDriverLocation;

      // Démarrer le tracking
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: config.accuracy,
          timeInterval: config.timeInterval,
          distanceInterval: config.distanceInterval,
        },
        (newLocation) => {
          const newDriverLocation: DriverLocation = {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            heading: newLocation.coords.heading,
            speed: newLocation.coords.speed,
            accuracy: newLocation.coords.accuracy || 0,
            timestamp: newLocation.timestamp,
          };

          // Calculer la direction si pas fournie par le GPS
          if (!newDriverLocation.heading && previousLocationRef.current) {
            newDriverLocation.heading = calculateHeading(
              previousLocationRef.current,
              newDriverLocation
            );
          }

          setLocation(newDriverLocation);
          previousLocationRef.current = newDriverLocation;
        }
      );

      subscriptionRef.current = subscription;
      setIsTracking(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de tracking');
      setIsTracking(false);
    }
  }, [config, calculateHeading]);

  const stopTracking = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
    setIsTracking(false);
  }, []);

  useEffect(() => {
    if (config.enabled) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => {
      stopTracking();
    };
  }, [config.enabled, startTracking, stopTracking]);

  return {
    location,
    isTracking,
    error,
    startTracking,
    stopTracking,
  };
}
