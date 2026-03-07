import { storageService } from '@/services/storage';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@react-native-async-storage/async-storage');

describe('storageService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should save tour to storage', async () => {
        const tour = { id: '1', driverId: 'D001', parcels: [] };
        await storageService.saveTour(tour as any);
        expect(AsyncStorage.setItem).toHaveBeenCalledWith(
            'koligo_tour',
            JSON.stringify(tour)
        );
    });

    it('should retrieve tour from storage', async () => {
        const tour = { id: '1', driverId: 'D001', parcels: [] };
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(tour));

        const result = await storageService.getTour();
        expect(result).toEqual(tour);
    });

    it('should return null when no cached tour', async () => {
        (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

        const result = await storageService.getTour();
        expect(result).toBeNull();
    });
});
