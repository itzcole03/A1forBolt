export interface CacheConfig {
  ttl: number;
  keyPrefix: string;
  maxEntries?: number;
  maxSize?: number;
  invalidationRules: Array<{
    type: 'time' | 'event';
    threshold?: number;
    event?: string;
  }>;
}

export interface CacheEntry<T = any> {
  value: T;
  timestamp: number;
  expiresAt: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  keys: number;
}

export interface UnifiedLogger {
  configure(config: Partial<LoggerConfig>): void;
  setLogLevel(level: LogLevel): void;
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string, ...args: any[]): void;
  getLogs(): string[];
  clearLogs(): void;
}

export interface UnifiedMetrics {
  track(event: string, properties?: Record<string, any>): void;
  increment(metric: string, tags?: Record<string, string>): void;
  gauge(metric: string, value: number, tags?: Record<string, string>): void;
  timing(metric: string, value: number, tags?: Record<string, string>): void;
}

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LoggerConfig {
  level: LogLevel;
  format: 'json' | 'text';
  destination: 'console' | 'file';
  filePath?: string;
}
