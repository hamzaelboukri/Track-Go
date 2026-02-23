import { View, Text, TouchableOpacity } from 'react-native';
import { Colis } from '../../types/colis';
import React from 'react';
import { twMerge } from 'nativewind';

interface Props {
  colis: Colis;
  onPress: () => void;
}

const ColisCard = React.memo(({ colis, onPress }: Props) => (
  <TouchableOpacity onPress={onPress} className={twMerge('bg-white rounded-lg p-4 mb-2 shadow')}> 
    <View className="flex-row justify-between items-center">
      <View>
        <Text className="font-bold text-lg">{colis.clientName}</Text>
        <Text className="text-gray-500">{colis.address}</Text>
        <Text className="text-xs text-gray-400">Status: {colis.status}</Text>
      </View>
      <Text className="text-xs text-gray-400">#{colis.id}</Text>
    </View>
  </TouchableOpacity>
));

export default ColisCard;
