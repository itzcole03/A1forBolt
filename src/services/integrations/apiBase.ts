// Base class for all API connectors
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export abstract class ApiBase {
  protected client: AxiosInstance;
  protected baseUrl: string;
  protected apiKey?: string;
  protected maxRetries: number = 3;
  protected retryDelay: number = 1000;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.client = axios.create({ baseURL: baseUrl });
  }

  protected async request<T>(config: AxiosRequestConfig, attempt = 1): Promise<T> {
    try {
      return (await this.client.request<T>(config)).data;
    } catch (error: any) {
      if (attempt < this.maxRetries) {
        await new Promise(res => setTimeout(res, this.retryDelay * attempt));
        return this.request<T>(config, attempt + 1);
      }
      this.logError(error, config);
      throw error;
    }
  }

  protected logError(error: any, config: AxiosRequestConfig) {
    // Log to console and optionally to /logs/liveData.log
    console.error(`[API ERROR] ${config.url}:`, error.message);
    // TODO: Append to /logs/liveData.log if running in Node
  }
}
