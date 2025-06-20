import { EventEmitter } from 'events';

export interface SportsNewsArticle {
  id: string;
  title: string;
  summary: string;
  url: string;
  publishedAt: string;
}

interface ApiConfig {
  baseURL: string;
  timeout?: number;
}

/**
 * Modern ExternalApiService with proper async/await and error handling
 */
export class ExternalApiService extends EventEmitter {
  private config: ApiConfig;

  constructor(config: ApiConfig) {
    super();
    this.config = config;
  }

  /**
   * @deprecated Use newsService.fetchHeadlines instead. This method will be removed in a future release.
   * Calls the unified newsService.fetchHeadlines for robust news fetching.
   */
  public async getSportsNews(): Promise<SportsNewsArticle[]> {
    // DEPRECATED: Use newsService.fetchHeadlines instead
    console.warn('[DEPRECATED] ExternalApiService.getSportsNews is deprecated. Use newsService.fetchHeadlines for unified news fetching.');
    
    try {
      // Dynamic import to avoid circular dependencies
      const newsServiceModule = await import('../newsService.js');
      const headlines = await newsServiceModule.newsService.fetchHeadlines(10);
      
      // Map ESPNHeadline to SportsNewsArticle
      return headlines.map((h: any) => ({
        id: h.id || `article-${Date.now()}`,
        title: h.title || h.summary || 'Untitled',
        summary: h.summary || h.title || 'No summary available',
        url: h.link || '',
        publishedAt: h.publishedAt || new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Error fetching sports news:', error);
      this.emit('error', error);
      
      // Return fallback data
      return [
        {
          id: 'fallback-1',
          title: 'Sports News Unavailable',
          summary: 'Unable to fetch latest sports news at this time.',
          url: '',
          publishedAt: new Date().toISOString(),
        },
      ];
    }
  }

  // Add more endpoints as needed
  public async getSchedule(): Promise<any[]> {
    try {
      const response = await fetch(`${this.config.baseURL}/schedule`, {
        signal: AbortSignal.timeout(this.config.timeout || 5000),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching schedule:', error);
      this.emit('error', error);
      return [];
    }
  }
}

export const externalApiService = new ExternalApiService({
  baseURL: import.meta.env.VITE_EXTERNAL_API_URL || 'https://api.sportsdata.io/v3/news',
  timeout: 10000,
});
