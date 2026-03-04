import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated as RNAnimated } from 'react-native';
import { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { DriverLocation } from '@/hooks/useDriverLocationTracking';

interface DriverMarkerProps {
  location: DriverLocation;
  showAccuracy?: boolean;
}

export function DriverMarker({ location, showAccuracy = false }: DriverMarkerProps) {
  const { colors } = useAppTheme();
  const rotationAnim = useRef(new RNAnimated.Value(0)).current;
  const pulseAnim = useRef(new RNAnimated.Value(1)).current;

  // Animation de rotation
  useEffect(() => {
    if (location.heading !== null) {
      RNAnimated.timing(rotationAnim, {
        toValue: location.heading,
        duration: 500,
        useNativeDriver: true,
      }).start();
    }
  }, [location.heading, rotationAnim]);

  // Animation de pulsation
  useEffect(() => {
    const pulse = RNAnimated.sequence([
      RNAnimated.timing(pulseAnim, {
        toValue: 1.2,
        duration: 1000,
        useNativeDriver: true,
      }),
      RNAnimated.timing(pulseAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]);

    RNAnimated.loop(pulse).start();
  }, [pulseAnim]);

  const rotation = rotationAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <>
      {/* Cercle de précision */}
      {showAccuracy && (
        <Marker
          coordinate={{
            latitude: location.latitude,
            longitude: location.longitude,
          }}
          anchor={{ x: 0.5, y: 0.5 }}
          zIndex={0}
        >
          <View
            style={[
              styles.accuracyCircle,
              {
                width: location.accuracy * 2,
                height: location.accuracy * 2,
                borderRadius: location.accuracy,
                backgroundColor: colors.accent + '20',
                borderColor: colors.accent + '40',
              },
            ]}
          />
        </Marker>
      )}

      {/* Marqueur du livreur */}
      <Marker
        coordinate={{
          latitude: location.latitude,
          longitude: location.longitude,
        }}
        anchor={{ x: 0.5, y: 0.5 }}
        flat={true}
        zIndex={1000}
      >
        <RNAnimated.View
          style={[
            styles.driverMarkerContainer,
            {
              transform: [
                { rotate: rotation },
                { scale: pulseAnim },
              ],
            },
          ]}
        >
          <View style={[styles.driverMarker, { backgroundColor: colors.accent }]}>
            <Ionicons name="navigate" size={24} color="#FFF" />
          </View>
          
          {/* Ombre */}
          <View style={[styles.markerShadow, { backgroundColor: colors.accent + '30' }]} />
        </RNAnimated.View>
      </Marker>
    </>
  );
}

const styles = StyleSheet.create({
  accuracyCircle: {
    borderWidth: 1,
  },
  driverMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  driverMarker: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerShadow: {
    position: 'absolute',
    bottom: -4,
    width: 32,
    height: 8,
    borderRadius: 16,
    opacity: 0.5,
  },
});
