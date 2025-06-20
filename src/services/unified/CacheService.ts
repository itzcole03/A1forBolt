import { apiClient } from '../api/client';

export class CacheService {
    static async get(key: string) {
        try {
            const response = await apiClient.get(`/cache/get?key=${encodeURIComponent(key)}`);
            return response.data?.value ?? null;
        } catch (error) {
            console.error('CacheService.get failed:', error);
            return null;
        }
    }

    static async set(key: string, value: any) {
        try {
            await apiClient.post('/cache/set', { key, value });
            return true;
        } catch (error) {
            console.error('CacheService.set failed:', error);
            return false;
        }
    }
}
export default CacheService;
