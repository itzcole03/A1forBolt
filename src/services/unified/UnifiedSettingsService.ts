import { BaseService } from './BaseService';
import { UnifiedServiceRegistry } from './UnifiedServiceRegistry';
import { UnifiedErrorService } from './UnifiedErrorService';

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  dateFormat: string;
  numberFormat: string;
  currency: string;
  notifications: {
    enabled: boolean;
    sound: boolean;
    vibration: boolean;
  };
  display: {
    compactMode: boolean;
    showAnimations: boolean;
    fontSize: number;
  };
  performance: {
    cacheEnabled: boolean;
    cacheDuration: number;
    maxConcurrentRequests: number;
  };
  security: {
    twoFactorEnabled: boolean;
    sessionTimeout: number;
    passwordExpiry: number;
  };
}

export class UnifiedSettingsService extends BaseService {
  private static instance: UnifiedSettingsService;
  private readonly errorService: UnifiedErrorService;
  private settings: AppSettings;

  private constructor(registry: UnifiedServiceRegistry) {
    super('settings', registry);
    this.errorService = UnifiedErrorService.getInstance(registry);
    this.settings = this.loadSettings();
  }

  public static getInstance(registry: UnifiedServiceRegistry): UnifiedSettingsService {
    if (!UnifiedSettingsService.instance) {
      UnifiedSettingsService.instance = new UnifiedSettingsService(registry);
    }
    return UnifiedSettingsService.instance;
  }

  public getSettings(): AppSettings {
    return { ...this.settings };
  }

  public updateSettings(updates: Partial<AppSettings>): void {
    try {
      const previousSettings = { ...this.settings };
      this.settings = { ...this.settings, ...updates };

      this.saveSettings();
      this.serviceRegistry.emit('settings:updated', {
        previousSettings,
        currentSettings: this.settings,
        updates,
      });
    } catch (error) {
      this.errorService.handleError(error, {
        code: 'SETTINGS_ERROR',
        source: 'UnifiedSettingsService',
        details: { method: 'updateSettings', updates },
      });
      throw error;
    }
  }

  public resetSettings(): void {
    try {
      const previousSettings = { ...this.settings };
      this.settings = this.getDefaultSettings();

      this.saveSettings();
      this.serviceRegistry.emit('settings:reset', {
        previousSettings,
        currentSettings: this.settings,
      });
    } catch (error) {
      this.errorService.handleError(error, {
        code: 'SETTINGS_ERROR',
        source: 'UnifiedSettingsService',
        details: { method: 'resetSettings' },
      });
      throw error;
    }
  }

  public subscribe(callback: (settings: AppSettings) => void): () => void {
    const handler = (event: { currentSettings: AppSettings }) => {
      callback(event.currentSettings);
    };

    this.serviceRegistry.on('settings:updated', handler);
    return () => this.serviceRegistry.off('settings:updated', handler);
  }

  private loadSettings(): AppSettings {
    try {
      const savedSettings = localStorage.getItem('app_settings');
      if (savedSettings) {
        return JSON.parse(savedSettings);
      }
    } catch (error) {
      this.errorService.handleError(error, {
        code: 'SETTINGS_ERROR',
        source: 'UnifiedSettingsService',
        details: { method: 'loadSettings' },
      });
    }

    return this.getDefaultSettings();
  }

  private saveSettings(): void {
    try {
      localStorage.setItem('app_settings', JSON.stringify(this.settings));
    } catch (error) {
      this.errorService.handleError(error, {
        code: 'SETTINGS_ERROR',
        source: 'UnifiedSettingsService',
        details: { method: 'saveSettings' },
      });
    }
  }

  private getDefaultSettings(): AppSettings {
    return {
      theme: 'system',
      language: 'en',
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      dateFormat: 'MM/DD/YYYY',
      numberFormat: 'en-US',
      currency: 'USD',
      notifications: {
        enabled: true,
        sound: true,
        vibration: true,
      },
      display: {
        compactMode: false,
        showAnimations: true,
        fontSize: 16,
      },
      performance: {
        cacheEnabled: true,
        cacheDuration: 300,
        maxConcurrentRequests: 5,
      },
      security: {
        twoFactorEnabled: false,
        sessionTimeout: 3600,
        passwordExpiry: 90,
      },
    };
  }

  public getSettingValue<T>(key: string): T | undefined {
    return this.getNestedValue(this.settings, key) as T | undefined;
  }

  public setSettingValue<T>(key: string, value: T): void {
    try {
      const previousValue = this.getNestedValue(this.settings, key);
      this.setNestedValue(this.settings, key, value);

      this.saveSettings();
      this.serviceRegistry.emit('settings:updated', {
        previousSettings: { ...this.settings, [key]: previousValue },
        currentSettings: this.settings,
        updates: { [key]: value },
      });
    } catch (error) {
      this.errorService.handleError(error, {
        code: 'SETTINGS_ERROR',
        source: 'UnifiedSettingsService',
        details: { method: 'setSettingValue', key, value },
      });
      throw error;
    }
  }

  /**
   * Safely get a nested value from an object using a dot-separated path.
   */
  private getNestedValue<T = unknown>(obj: Record<string, unknown>, path: string): T | undefined {
    return path.split('.').reduce<unknown>((current, key) =>
      typeof current === 'object' && current !== null && key in current ? (current as Record<string, unknown>)[key] : undefined,
    obj) as T | undefined;
  }

  /**
   * Safely set a nested value in an object using a dot-separated path.
   */
  private setNestedValue<T = unknown>(obj: Record<string, unknown>, path: string, value: T): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    let target: Record<string, unknown> = obj;
    for (const key of keys) {
      if (!(key in target) || typeof target[key] !== 'object' || target[key] === null) {
        target[key] = {};
      }
      target = target[key] as Record<string, unknown>;
    }
    target[lastKey] = value;
  }

  public exportSettings(): string {
    try {
      return JSON.stringify(this.settings, null, 2);
    } catch (error) {
      this.errorService.handleError(error, {
        code: 'SETTINGS_ERROR',
        source: 'UnifiedSettingsService',
        details: { method: 'exportSettings' },
      });
      throw error;
    }
  }
}
