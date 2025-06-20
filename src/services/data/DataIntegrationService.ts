import { Subject, Observable } from 'rxjs';
import { newsService } from '../services/newsService';
import type { ESPNHeadline } from '../types/index';

type DataStreamType = 'news';

interface DataStream<T> {
  type: DataStreamType;
  data: T;
  timestamp: number;
}

interface DataCache<T> {
  [key: string]: {
    data: T;
    timestamp: number;
    ttl: number;
  };
}

class DataIntegrationService {
  private dataStreams: Map<DataStreamType, Subject<DataStream<ESPNHeadline[]>>> = new Map();
  private cache: DataCache<ESPNHeadline[]> = {};
  private updateIntervals: Map<string, NodeJS.Timeout> = new Map();
  private readonly DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    this.initializeStreams();
  }

  private initializeStreams() {
    // Initialize data streams
    // Only 'news' stream is implemented in this modernized version
    this.dataStreams.set('news', new Subject<DataStream<ESPNHeadline[]>>());

    // All legacy WebSocket streams removed as part of modernization.
    // If needed, implement WebSocket integration here.
  }

  public startAllStreams() {
    // Start periodic data updates
    this.startPeriodicUpdate('stats', 60000); // Update stats every minute
    this.startPeriodicUpdate('odds', 30000); // Update odds every 30 seconds
    this.startPeriodicUpdate('injuries', 300000); // Update injuries every 5 minutes
    this.startPeriodicUpdate('news', 300000); // Update news every 5 minutes
  }

  private startPeriodicUpdate(type: string, interval: number) {
    // Clear existing interval if any
    if (this.updateIntervals.has(type)) {
      clearInterval(this.updateIntervals.get(type));
    }

    // Set new interval
    const intervalId = setInterval(async () => {
      try {
        await this.fetchAndUpdateData(type);
      } catch (error) {
        console.error(`Error updating ${type} data:`, error);
      }
    }, interval);

    this.updateIntervals.set(type, intervalId);
  }

  private async fetchAndUpdateData(type: string): Promise<void> {
    if (type === 'news') {
      try {
        const headlines: ESPNHeadline[] = await newsService.fetchHeadlines('espn', 10);
        this.updateCache('news', headlines);
        this.emitUpdate('news', headlines);
      } catch (error) {
        console.error('Failed to fetch news headlines:', error);
      }
    } else {
      // TODO: Implement stats/odds/injuries fetching using modernized services
      // For now, do nothing for other types
    }
  }

  // WebSocket data handling removed as part of modernization.
  // If real-time updates are needed, implement here with strict typing.

  private updateCache(key: string, data: ESPNHeadline[], ttl: number = this.DEFAULT_CACHE_TTL): void {
    this.cache[key] = {
      data,
      timestamp: Date.now(),
      ttl,
    };
  }

  public getCachedData(key: string): ESPNHeadline[] | null {
    const cached = this.cache[key];
    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
      delete this.cache[key];
      return null;
    }

    return cached.data;
  }

  public getStream(type: 'news'): Observable<DataStream<ESPNHeadline[]>> {
    const stream = this.dataStreams.get(type);
    if (!stream) {
      throw new Error(`Stream not found for type: ${type}`);
    }
    return stream.asObservable();
  }

  private emitUpdate(type: DataStreamType, data: ESPNHeadline[]): void {
    const stream = this.dataStreams.get(type);
    if (stream) {
      stream.next({
        type,
        data,
        timestamp: Date.now(),
      });
    }
  }

  // Historical data fetching removed as part of modernization.
  // If needed, implement with strict typing and modern services.

  public stopAllStreams() {
    // Clear all update intervals
    this.updateIntervals.forEach(interval => clearInterval(interval));
    this.updateIntervals.clear();

    // Complete all subjects
    this.dataStreams.forEach(stream => stream.complete());
    this.dataStreams.clear();
  }
}

export const dataIntegrationService = new DataIntegrationService();
