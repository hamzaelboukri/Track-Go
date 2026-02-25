import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Tour } from '@/shared/schema';

const TOUR_KEY = 'koligo_tour';

export const storageService = {
    async saveTour(tour: Tour): Promise<void> {
        await AsyncStorage.setItem(TOUR_KEY, JSON.stringify(tour));
    },

    async getTour(): Promise<Tour | null> {
        const data = await AsyncStorage.getItem(TOUR_KEY);
        return data ? JSON.parse(data) : null;
    },

    async clearTour(): Promise<void> {
        await AsyncStorage.removeItem(TOUR_KEY);
    },
};
