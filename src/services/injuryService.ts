import axios from 'axios';
import type { InjuryData } from '../types/core.js';
import { UnifiedConfig } from '../unified/UnifiedConfig.js';
import { EventBus } from '../unified/EventBus.js';
// import type { InjuryRecord } from '../types/core'; // Unused import removed

/**
 * Strictly typed injury data interface.
 */
// Modernized InjuryData interface for strict typing
export interface InjuryData {
  playerId: string;
  playerName: string;
  team: string;
  position: string;
  status: string;
  injuryType: string;
  description: string;
  expectedReturn: string;
  updated: string;
}

class InjuryService {
  private readonly config: {
    apiKey: string;
    baseUrl: string;
    timeout: number;
    enableFeatureFlag: boolean;
  };
  private readonly client;
  private readonly eventBus: EventBus;

  constructor() {
    const configManager = UnifiedConfig.getInstance();
    this.config = configManager.get('injury');
    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: { 'X-API-Key': this.config.apiKey },
    });
    this.eventBus = EventBus.getInstance();
  }

  /**
   * Fetches strictly typed injury data from real API only. Emits 'injury:update' event.
   * @param params Optional filter params (strictly typed)
   * @returns InjuryData[]
   */
  async getInjuries(params?: Partial<InjuryData>): Promise<InjuryData[]> {
    if (!this.config.enableFeatureFlag) {
      throw new Error('Injury feature is disabled by config.');
    }
    const response = await this.client.get<InjuryData[]>('/injuries', { params });
    const injuries = response.data;
    this.eventBus.emit('injury:update', {
          injuries,
      timestamp: Date.now(),
    });
    return injuries;
  }

  /**
   * Type guard for InjuryData
   * @param data unknown
   * @returns data is InjuryData
   */
  private isInjuryData(data: unknown): data is InjuryData {
    return (
      typeof data === 'object' &&
      data !== null &&
      'playerId' in data &&
      'playerName' in data &&
      'team' in data &&
      'position' in data &&
      'status' in data &&
      'injuryType' in data &&
      'description' in data &&
      'expectedReturn' in data &&
      'updated' in data
    );
  }
}

// TODO: Add comprehensive unit and integration tests for all fallback and error-handling logic.
export const injuryService = new InjuryService();
