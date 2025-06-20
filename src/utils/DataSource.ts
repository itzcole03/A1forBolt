

export interface DataSource<T> {
  id: string;
  fetch(): Promise<T>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getData(): Promise<T>;
  isConnected(): boolean;
  getMetadata(): Record<string, any>;
}

export interface DataSourceConfig {
  url: string;
  apiKey?: string;
  options?: Record<string, any>;
}

export interface DataSourceMetrics {
  latency: number[];
  errorRate: number;
  lastUpdate: number;
  dataQuality: number;
} 