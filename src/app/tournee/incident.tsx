import React, { useState } from 'react';
import { View, Text, TextInput, Button, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function IncidentFormScreen() {
  const [reason, setReason] = useState('');
  const [photo, setPhoto] = useState<string | undefined>();

  const pickImage = async () => {
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images });
    if (!result.canceled && result.assets.length > 0) {
      setPhoto(result.assets[0].uri);
    }
  };

  return (
    <View className="flex-1 p-4 bg-white">
      <Text className="text-xl font-bold mb-2">Signaler un incident</Text>
      <TextInput
        placeholder="Décrivez l'incident"
        value={reason}
        onChangeText={setReason}
        className="border rounded mb-4 p-2"
      />
      <Button title="Prendre une photo" onPress={pickImage} />
      {photo && <Image source={{ uri: photo }} className="w-32 h-32 my-2" />}
      <Button title="Envoyer" onPress={() => {/* submit logic */}} />
    </View>
  );
}
