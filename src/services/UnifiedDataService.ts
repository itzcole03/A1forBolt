
// ESM-compatible event emitter (no external dependency)
type Listener = (...args: unknown[]) => void;
class SimpleEventEmitter {
  private listeners: Record<string, Listener[]> = {};
  on(event: string, listener: Listener) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(listener);
  }
  off(event: string, listener: Listener) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(l => l !== listener);
  }
  emit(event: string, ...args: unknown[]) {
    if (!this.listeners[event]) return;
    for (const l of this.listeners[event]) l(...args);
  }
}
declare const io: unknown;

import { API_CONFIG } from '../config/apiConfig.js';
import { wrapWithRateLimit } from './rateLimit/wrapWithRateLimit.js';



// Data source types
export enum DataSource {
  PRIZEPICKS = 'prizepicks',
  ESPN = 'espn',
  ODDS_API = 'odds_api',
}


// Unified response schema
// (Removed unused DataResponseSchema)
export type DataResponse<T = unknown> = {
  source: DataSource;
  timestamp: number;
  data: T | null;
  status: 'success' | 'error';
};


export class UnifiedDataService extends SimpleEventEmitter {
  private static instance: UnifiedDataService;
  private wsConnections: Map<DataSource, { disconnect?: () => void } | undefined>;
  private cache: Map<string, { data: unknown; timestamp: number }>;

  private constructor() {
    super();
    this.wsConnections = new Map();
    this.cache = new Map();
  }

  static getInstance(): UnifiedDataService {
    if (!UnifiedDataService.instance) {
      UnifiedDataService.instance = new UnifiedDataService();
    }
    return UnifiedDataService.instance;
  }

  private getBaseUrl(source: DataSource): string {
    switch (source) {
      case DataSource.PRIZEPICKS:
        return API_CONFIG.SPORTS_DATA.BASE_URL;
      case DataSource.ESPN:
        return API_CONFIG.NEWS.BASE_URL;
      case DataSource.ODDS_API:
        return API_CONFIG.ODDS_DATA.BASE_URL;
      default:
        return '';
    }
  }

  /**
   * Fetch data from a backend API, with caching and rate limiting.
   */
  fetchData = wrapWithRateLimit(async <T = unknown>(source: DataSource, endpoint: string, params?: Record<string, string | number>): Promise<DataResponse<T>> => {
    const cacheKey = `${source}:${endpoint}:${params ? JSON.stringify(params) : ''}`;
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 30000) {
      return {
        source,
        timestamp: cached.timestamp,
        data: cached.data as T,
        status: 'success',
      };
    }
    try {
      const baseUrl = this.getBaseUrl(source);
      const url = new URL(endpoint, baseUrl);
      if (params) {
        Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, String(v)));
      }
      const res = await fetch(url.toString(), {
        method: 'GET',
        headers: { 'x-api-key': API_CONFIG.SPORTS_DATA.API_KEY },
      });
      if (!res.ok) throw new Error(`Failed to fetch data: ${res.statusText}`);
      const data = (await res.json()) as T;
      this.cache.set(cacheKey, { data, timestamp: Date.now() });
      return {
        source,
        timestamp: Date.now(),
        data,
        status: 'success',
      };
    } catch (error) {
      this.emit('error', { source, error });
      return {
        source,
        timestamp: Date.now(),
        data: null,
        status: 'error',
      };
    }
  });


  connectWebSocket(source: DataSource, options: { events: string[] }) {
    if (this.wsConnections.has(source)) return;
    if (!io || typeof io !== 'function') return;
    // @ts-expect-error: dynamic import fallback for socket.io-client
    const socket = (io as unknown as (url: string, opts: object) => { on: (event: string, cb: (data: unknown) => void) => void; disconnect?: () => void })(
      this.getBaseUrl(source), { transports: ['websocket'], autoConnect: true }
    );
    options.events.forEach(event => {
      socket.on(event, (data: unknown) => {
        this.emit(`ws:${source}:${event}`, data);
      });
    });
    socket.on('connect_error', (error: unknown) => {
      this.emit('ws:error', { source, error });
    });
    this.wsConnections.set(source, socket);
  }


  disconnectWebSocket(source: DataSource) {
    const socket = this.wsConnections.get(source);
    if (socket && typeof socket.disconnect === 'function') {
      socket.disconnect();
      this.wsConnections.delete(source);
    }
  }

  clearCache() {
    this.cache.clear();
  }
} 