import EventEmitter from 'eventemitter3';
import { AxiosInstance } from 'axios';



export interface ApiResponse<T> {
  data: T;
  status: number;
  timestamp: number;
}

export interface ApiServiceConfig {
  baseURL: string;
  timeout?: number;
  retryAttempts?: number;
}

export interface ApiServiceEvents {
  error: (error: Error) => void;
  request: (endpoint: string) => void;
  response: (response: ApiResponse<unknown>) => void;
}

export abstract class BaseApiService extends EventEmitter<ApiServiceEvents> {
  protected readonly client: AxiosInstance;
  protected readonly config: ApiServiceConfig;

  constructor(config: ApiServiceConfig) {
    super();
    this.config = config;
    this.client = this.initializeClient();
  }

  protected abstract initializeClient(): AxiosInstance;
  
  protected abstract handleError(error: Error): void;
  
  protected abstract handleResponse<T>(response: ApiResponse<T>): void;
  
  public abstract get<T>(endpoint: string, params?: Record<string, unknown>): Promise<T>;
  
  public abstract post<T>(endpoint: string, data: unknown): Promise<T>;
} 