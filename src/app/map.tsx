import React from 'react';
import { View, StyleSheet } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useTournee } from '../hooks/useTournee';

export default function MapScreen() {
  const { state } = useTournee();
  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={StyleSheet.absoluteFill}
        initialRegion={{
          latitude: state.colis[0]?.lat || 48.8566,
          longitude: state.colis[0]?.lng || 2.3522,
          latitudeDelta: 0.1,
          longitudeDelta: 0.1,
        }}
      >
        {state.colis.map(colis => (
          <Marker
            key={colis.id}
            coordinate={{ latitude: colis.lat, longitude: colis.lng }}
            title={colis.clientName}
            description={colis.address}
          />
        ))}
      </MapView>
    </View>
  );
}
