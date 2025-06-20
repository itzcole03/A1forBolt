import axios, { AxiosInstance } from 'axios';
import { BaseApiService, ApiResponse, ApiServiceConfig } from './ApiService';



export interface PrizePicksProp {
  id: string;
  type: string;
  value: number;
  player: {
    name: string;
    team: string;
    position: string;
  };
  game: {
    startTime: string;
    homeTeam: string;
    awayTeam: string;
  };
}

export class PrizePicksApiService extends BaseApiService {
  protected initializeClient(): AxiosInstance {
    return axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout || 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  protected handleError(error: Error): void {
    this.emit('error', error);
    console.error('[PrizePicks API Error]:', error);
  }

  protected handleResponse<T>(response: ApiResponse<T>): void {
    this.emit('response', response);
  }

  public async get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    try {
      this.emit('request', endpoint);
      const response = await this.client.get<T>(endpoint, { params });
      const apiResponse: ApiResponse<T> = {
        data: response.data,
        status: response.status,
        timestamp: Date.now(),
      };
      this.handleResponse(apiResponse);
      return response.data;
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  public async post<T>(endpoint: string, data: unknown): Promise<T> {
    try {
      this.emit('request', endpoint);
      const response = await this.client.post<T>(endpoint, data);
      const apiResponse: ApiResponse<T> = {
        data: response.data,
        status: response.status,
        timestamp: Date.now(),
      };
      this.handleResponse(apiResponse);
      return response.data;
    } catch (error) {
      this.handleError(error as Error);
      throw error;
    }
  }

  // PrizePicks specific methods
  public async getAvailableProps(): Promise<PrizePicksProp[]> {
    return this.get<PrizePicksProp[]>('/props/available');
  }

  public async getPlayerStats(playerId: string): Promise<any> {
    return this.get(`/players/${playerId}/stats`);
  }

  public async getGameDetails(gameId: string): Promise<any> {
    return this.get(`/games/${gameId}`);
  }
} 