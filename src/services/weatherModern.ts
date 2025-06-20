import { UnifiedConfig } from '../unified/UnifiedConfig.js';
import { EventBus } from '../unified/EventBus.js';
import type { WeatherData } from '../types/core.js';

export class WeatherService {
  private readonly eventBus: EventBus;
  private readonly config: UnifiedConfig;
  private cache = new Map<string, { data: WeatherData; timestamp: number }>();
  private readonly CACHE_TTL = 600000; // 10 minutes

  constructor() {
    this.config = UnifiedConfig.getInstance();
    this.eventBus = EventBus.getInstance();
  }

  /**
   * Get current weather for a location
   */
  async getCurrentWeather(location: string): Promise<WeatherData> {
    if (!this.config.get('enableWeather')) {
      const error = new Error('Weather feature is disabled by config.');
      this.eventBus.emit('error:occurred', error);
      throw error;
    }

    const cacheKey = `weather:${location}`;
    const cached = this.getCachedData(cacheKey);
    if (cached) return cached;

    try {
      // Replace with real API call using config values if available
      // Example: fetch from OpenWeatherMap or similar
      throw new Error('Weather API integration not implemented.');
    } catch (error) {
      this.eventBus.emit('error:occurred', error as Error);
      throw error;
    }
  }

  /**
   * Get historical weather data
   */
   
  async getHistoricalWeather(_location: string, _date: string): Promise<WeatherData> {
    if (!this.config.get('enableWeather')) {
      const error = new Error('Weather feature is disabled by config.');
      this.eventBus.emit('error:occurred', error);
      throw error;
    }
    try {
      throw new Error('Historical weather API integration not implemented.');
    } catch (error) {
      this.eventBus.emit('error:occurred', error as Error);
      throw error;
    }
  }

  /**
   * Get weather alerts for a location
   */
   
  async getWeatherAlerts(_location: string): Promise<WeatherData['alerts']> {
    if (!this.config.get('enableWeather')) {
      const error = new Error('Weather feature is disabled by config.');
      this.eventBus.emit('error:occurred', error);
      throw error;
    }
    try {
      throw new Error('Weather alerts API integration not implemented.');
    } catch (error) {
      this.eventBus.emit('error:occurred', error as Error);
      throw error;
    }
  }

  /**
   * Get cached data if still valid
   */
  private getCachedData(key: string): WeatherData | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }
    return null;
  }
}

// Export singleton instance
export const weatherService = new WeatherService();
