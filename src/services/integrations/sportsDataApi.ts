import { ApiBase } from './apiBase';
import { API_CONFIG } from '../../config/apiConfig';

export class SportsDataApi extends ApiBase {
  constructor() {
    super(API_CONFIG.SPORTS_DATA.BASE_URL, API_CONFIG.SPORTS_DATA.API_KEY);
  }

  async getGames(params: Record<string, any> = {}) {
    return this.request({
      url: '/games',
      method: 'GET',
      params: { ...params, api_key: this.apiKey },
    });
  }

  async getPlayers(params: Record<string, any> = {}) {
    return this.request({
      url: '/players',
      method: 'GET',
      params: { ...params, api_key: this.apiKey },
    });
  }

  // Add more endpoints as needed
}
