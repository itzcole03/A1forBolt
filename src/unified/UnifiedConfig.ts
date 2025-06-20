export interface FeatureFlag {
  enabled: boolean;
  id?: string;
  name?: string;
  description?: string;
}

export interface Config {
  enablePvPModel: FeatureFlag;
  enablePlayerFormModel: FeatureFlag;
  enableVenueEffectModel: FeatureFlag;
  enableRefereeImpactModel: FeatureFlag;
  enableLineupSynergyModel: FeatureFlag;
  enableNews: FeatureFlag;
  enableWeather: FeatureFlag;
  enableInjuries: FeatureFlag;
  enableAnalytics: FeatureFlag;
  enableSocialSentiment: FeatureFlag;
  socialSentiment: {
    provider: string;
    enabled: boolean;
  };
}

export class UnifiedConfig {
  private static instance: UnifiedConfig;
  private config: Config;
  private extraConfig: Record<string, any> = {};

  private constructor() {
    this.config = {
      enablePvPModel: { enabled: true },
      enablePlayerFormModel: { enabled: true },
      enableVenueEffectModel: { enabled: true },
      enableRefereeImpactModel: { enabled: true },
      enableLineupSynergyModel: { enabled: true },
      enableNews: { enabled: true },
      enableWeather: { enabled: true },
      enableInjuries: { enabled: true },
      enableAnalytics: { enabled: true },
      enableSocialSentiment: { enabled: true },
      socialSentiment: {
        provider: 'default',
        enabled: true
      }
    };
    // Set default for api.baseUrl if not present
    if (!this.extraConfig['api.baseUrl']) {
      this.extraConfig['api.baseUrl'] = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ? import.meta.env.VITE_API_BASE_URL : 'https://api.betproai.com';
    }
    // Set default for news config if not present
    if (!this.extraConfig['news']) {
      this.extraConfig['news'] = {
        apiBaseUrl: (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_NEWS_API_BASE_URL) ? import.meta.env.VITE_NEWS_API_BASE_URL : 'https://api.betproai.com',
        backendPrefix: '/api/news',
        timeout: 10000,
        enableFeatureFlag: true
      };
    }
  }

  public static getInstance(): UnifiedConfig {
    if (!UnifiedConfig.instance) {
      UnifiedConfig.instance = new UnifiedConfig();
    }
    return UnifiedConfig.instance;
  }

  public get<T = any>(key: string): T {
    if ((this.config as any)[key] !== undefined) {
      return (this.config as any)[key];
    }
    if (this.extraConfig[key] !== undefined) {
      return this.extraConfig[key];
    }
    // Provide default for api.baseUrl
    if (key === 'api.baseUrl') {
      return ((typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ? import.meta.env.VITE_API_BASE_URL : 'https://api.betproai.com') as T;
    }
    throw new Error(`Configuration key "${key}" not found`);
  }

  public set<T = any>(key: string, value: T): void {
    if ((this.config as any)[key] !== undefined) {
      (this.config as any)[key] = value;
    } else {
      this.extraConfig[key] = value;
    }
  }

  public getNested<T extends keyof Config, K extends keyof Config[T]>(
    section: T,
    key: K
  ): Config[T][K] {
    return this.config[section][key];
  }

  public setNested<T extends keyof Config, K extends keyof Config[T]>(
    section: T,
    key: K,
    value: Config[T][K]
  ): void {
    this.config[section][key] = value;
  }

  public getAll(): Config {
    return { ...this.config };
  }

  public reset(): void {
    this.config = {
      enablePvPModel: { enabled: true },
      enablePlayerFormModel: { enabled: true },
      enableVenueEffectModel: { enabled: true },
      enableRefereeImpactModel: { enabled: true },
      enableLineupSynergyModel: { enabled: true },
      enableNews: { enabled: true },
      enableWeather: { enabled: true },
      enableInjuries: { enabled: true },
      enableAnalytics: { enabled: true },
      enableSocialSentiment: { enabled: true },
      socialSentiment: {
        provider: 'default',
        enabled: true
      }
    };
  }
}
