import React, { useCallback } from 'react';
import { View, FlatList, RefreshControl } from 'react-native';
import ColisCard from '../components/colis/ColisCard';
import { useTournee } from '../hooks/useTournee';
import { fetchColis } from '../services/colis.service';
import { Colis } from '../types/colis';

export default function TourneeScreen() {
  const { state, dispatch } = useTournee();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await fetchColis();
      dispatch({ type: 'SET_COLIS', payload: data });
    } catch (e) {
      // fallback handled by reducer/AsyncStorage
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  const renderItem = useCallback(({ item }: { item: Colis }) => (
    <ColisCard colis={item} onPress={() => {/* navigate to detail */}} />
  ), []);

  const getItemLayout = useCallback((_, index) => ({
    length: 90,
    offset: 90 * index,
    index,
  }), []);

  return (
    <View className="flex-1 bg-gray-100 p-4">
      <FlatList
        data={state.colis}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        getItemLayout={getItemLayout}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        initialNumToRender={10}
        windowSize={5}
        removeClippedSubviews
      />
    </View>
  );
}
