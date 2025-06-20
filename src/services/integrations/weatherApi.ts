import { ApiBase } from './apiBase';
import { API_CONFIG } from '../../config/apiConfig';

export class WeatherApi extends ApiBase {
  constructor() {
    super(API_CONFIG.WEATHER.BASE_URL, API_CONFIG.WEATHER.API_KEY);
  }

  async getWeather(params: Record<string, any> = {}) {
    return this.request({
      url: '/weather',
      method: 'GET',
      params: { ...params, api_key: this.apiKey },
    });
  }

  // Add more endpoints as needed
}
