import { apiClient } from '../api/client';
import { unifiedMonitor } from '../../core/UnifiedMonitor';
import { APIError, AppError } from '../../core/UnifiedError';
import { PrizePicksAdapter } from '../../types';
import { prizePicksAdapter } from './prizepicks';

// Base adapter interface
interface BaseAdapter {
  name: string;
  isEnabled: boolean;
  initialize(): Promise<void>;
  validate(): Promise<boolean>;
}

// SportsRadar adapter
interface SportsRadarAdapter extends BaseAdapter {
  fetchLiveScores(): Promise<any[]>;
  fetchGameDetails(gameId: string): Promise<any>;
  fetchPlayerStats(playerId: string): Promise<any>;
}

// ESPN adapter
interface ESPNAdapter extends BaseAdapter {
  fetchHeadlines(): Promise<any[]>;
  fetchGameSummary(gameId: string): Promise<any>;
  fetchPlayerNews(playerId: string): Promise<any[]>;
}

// Unified adapter manager
class AdapterManager {
  private static instance: AdapterManager;
  private adapters: Map<string, any>;

  private constructor() {
    this.adapters = new Map();
    this.initializeAdapters();
  }

  public static getInstance(): AdapterManager {
    if (!AdapterManager.instance) {
      AdapterManager.instance = new AdapterManager();
    }
    return AdapterManager.instance;
  }

  private initializeAdapters(): void {
    this.adapters.set('prizepicks', prizePicksAdapter);
  }

  public getAdapter<T>(name: string): T | undefined {
    return this.adapters.get(name) as T;
  }

  public registerAdapter(name: string, adapter: any): void {
    this.adapters.set(name, adapter);
  }

  public isAdapterEnabled(name: string): boolean {
    return this.adapters.has(name);
  }
}

export const adapterManager = AdapterManager.getInstance();
export default adapterManager;
