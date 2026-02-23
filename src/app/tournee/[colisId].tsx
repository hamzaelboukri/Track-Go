import React from 'react';
import { View, Text, Button, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTournee } from '../../hooks/useTournee';

export default function ColisDetailScreen() {
  const { colisId } = useLocalSearchParams();
  const { state } = useTournee();
  const colis = state.colis.find(c => c.id === colisId);

  if (!colis) return <Text>Colis introuvable</Text>;

  return (
    <View className="flex-1 p-4 bg-white">
      <Text className="text-xl font-bold mb-2">{colis.clientName}</Text>
      <Text className="mb-1">Adresse: {colis.address}</Text>
      <Text className="mb-1">Status: {colis.status}</Text>
      {colis.proofPhoto && <Image source={{ uri: colis.proofPhoto }} className="w-32 h-32 my-2" />}
      <Button title="Scanner" onPress={() => {/* navigate to scan */}} />
      <Button title="Signaler incident" onPress={() => {/* navigate to incident */}} />
    </View>
  );
}
