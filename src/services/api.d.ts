import { AxiosRequestConfig } from 'axios';
interface ApiConfig {
  baseURL: string;
  timeout: number;
  maxRetries: number;
  retryDelay: number;
}
declare class ApiService {
  private static instance;
  private api;
  private config;
  private constructor();
  static getInstance(config?: Partial<ApiConfig>): ApiService;
  private setupInterceptors;
  private shouldRetry;
  private handleError;
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
  post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T>;
  setAuthToken(token: string): void;
  clearAuthToken(): void;
}
export declare const apiService: ApiService;
export {};
