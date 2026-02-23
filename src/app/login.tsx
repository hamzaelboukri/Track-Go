import React from 'react';
import { View, Text, TextInput, Button } from 'react-native';

export default function LoginScreen() {
  return (
    <View className="flex-1 justify-center items-center bg-white p-4">
      <Text className="text-2xl font-bold mb-4">Track&Go Login</Text>
      <TextInput placeholder="Email" className="border rounded w-full mb-2 p-2" />
      <TextInput placeholder="Mot de passe" secureTextEntry className="border rounded w-full mb-4 p-2" />
      <Button title="Connexion" onPress={() => {}} />
    </View>
  );
}
