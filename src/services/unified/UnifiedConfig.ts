
export class UnifiedConfig {
  private static instance: UnifiedConfig;
  private config: Record<string, unknown> = {};

  private constructor() {}

  static getInstance(): UnifiedConfig {
    if (!UnifiedConfig.instance) {
      UnifiedConfig.instance = new UnifiedConfig();
    }
    return UnifiedConfig.instance;
  }

  /**
   * Returns the API base URL from Vite env or config, with fallback.
   */
  getApiUrl(): string {
    return (
      (this.config['api.baseUrl'] as string | undefined) ||
      (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) ||
      'http://localhost:8000'
    );
  }

  get<T>(key: string, defaultValue?: T): T {
    const value = this.config[key];
    if (value !== undefined) return value as T;
    if (defaultValue !== undefined) return defaultValue;
    throw new Error(`Configuration key "${key}" not found`);
  }

  set<T>(key: string, value: T): void {
    this.config[key] = value;
  }

  has(key: string): boolean {
    return key in this.config;
  }

  delete(key: string): void {
    delete this.config[key];
  }

  clear(): void {
    this.config = {};
  }

  getAll(): Record<string, unknown> {
    return { ...this.config };
  }
}
