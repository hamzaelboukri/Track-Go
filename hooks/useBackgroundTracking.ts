import { useState, useEffect, useCallback } from 'react';
import { backgroundLocationService } from '@/services/backgroundLocationService';
import * as Location from 'expo-location';

export function useBackgroundTracking() {
  const [isTracking, setIsTracking] = useState(false);
  const [hasPermissions, setHasPermissions] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = useCallback(async () => {
    const tracking = await backgroundLocationService.isTracking();
    setIsTracking(tracking);

    const { status: fg } = await Location.getForegroundPermissionsAsync();
    const { status: bg } = await Location.getBackgroundPermissionsAsync();
    setHasPermissions(fg === 'granted' && bg === 'granted');

    const pending = await backgroundLocationService.getPendingCount();
    setPendingCount(pending);
  }, []);

  const requestPermissions = useCallback(async () => {
    setError(null);

    const { status: fg } = await Location.requestForegroundPermissionsAsync();
    if (fg !== 'granted') {
      setError('Permission foreground refusée');
      return false;
    }

    const { status: bg } = await Location.requestBackgroundPermissionsAsync();
    if (bg !== 'granted') {
      setError('Permission background refusée');
      return false;
    }

    setHasPermissions(true);
    return true;
  }, []);

  const startTracking = useCallback(async () => {
    setError(null);
    const result = await backgroundLocationService.startTracking();
    
    if (result.success) {
      setIsTracking(true);
    } else {
      setError(result.error || 'Erreur de démarrage');
    }

    return result.success;
  }, []);

  const stopTracking = useCallback(async () => {
    await backgroundLocationService.stopTracking();
    setIsTracking(false);
  }, []);

  const syncPending = useCallback(async () => {
    const synced = await backgroundLocationService.syncPendingLocations();
    await checkStatus();
    return synced;
  }, [checkStatus]);

  return {
    isTracking,
    hasPermissions,
    pendingCount,
    error,
    requestPermissions,
    startTracking,
    stopTracking,
    syncPending,
    checkStatus,
  };
}
