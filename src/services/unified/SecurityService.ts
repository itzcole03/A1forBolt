import { apiClient } from '../api/client';

export class SecurityService {
    static async authenticate(credentials: { username: string; password: string }) {
        try {
            const response = await apiClient.post('/auth/login', credentials);
            return response.data;
        } catch (error) {
            console.error('Authentication failed:', error);
            return false;
        }
    }

    static async logout() {
        try {
            await apiClient.post('/auth/logout');
            return true;
        } catch (error) {
            console.error('Logout failed:', error);
            return false;
        }
    }
}
export default SecurityService;
