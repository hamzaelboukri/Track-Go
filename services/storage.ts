import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Tour } from '@/shared/schema';

const TOUR_KEY = 'koligo_tour';
const ONBOARDING_KEY = 'koligo_onboarding_completed';

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

    async setOnboardingCompleted(completed: boolean): Promise<void> {
        await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(completed));
    },

    async isOnboardingCompleted(): Promise<boolean> {
        const data = await AsyncStorage.getItem(ONBOARDING_KEY);
        return data ? JSON.parse(data) : false;
    },

    async clearOnboarding(): Promise<void> {
        await AsyncStorage.removeItem(ONBOARDING_KEY);
    },
};
