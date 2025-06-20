import { ApiBase } from './apiBase';
import { API_CONFIG } from '../../config/apiConfig';

export class NewsApi extends ApiBase {
  constructor() {
    super(API_CONFIG.NEWS.BASE_URL, API_CONFIG.NEWS.API_KEY);
  }

  async getHeadlines(params: Record<string, any> = {}) {
    return this.request({
      url: '/headlines',
      method: 'GET',
      params: { ...params, api_key: this.apiKey },
    });
  }

  // Add more endpoints as needed
}
