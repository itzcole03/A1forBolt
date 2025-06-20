import { apiClient } from '../api/client';

export class PredictionService {
    static async updateConfig(config: any) {
        try {
            await apiClient.post('/ml/prediction/config', config);
            return true;
        } catch (error) {
            console.error('PredictionService.updateConfig failed:', error);
            return false;
        }
    }

    static async getPredictionHistory() {
        try {
            const response = await apiClient.get('/ml/prediction/history');
            return response.data;
        } catch (error) {
            console.error('PredictionService.getPredictionHistory failed:', error);
            return [];
        }
    }
}
export default PredictionService;
