import { UnifiedLogger } from './UnifiedLogger';
import { UnifiedServiceRegistry } from '../unified/UnifiedServiceRegistry';
import { promises as fs } from 'fs';
import path from 'path';

export class UnifiedSettingsService {
  private static instance: UnifiedSettingsService;
  private logger: UnifiedLogger;
  private settings: Map<string, any>;
  private settingsFile: string;

  private constructor(registry: UnifiedServiceRegistry) {
    this.logger = UnifiedLogger.getInstance();
    this.settings = new Map();
    this.settingsFile = path.join(process.cwd(), 'config', 'settings.json');
    this.loadSettings();
  }

  public static getInstance(registry: UnifiedServiceRegistry): UnifiedSettingsService {
    if (!UnifiedSettingsService.instance) {
      UnifiedSettingsService.instance = new UnifiedSettingsService(registry);
    }
    return UnifiedSettingsService.instance;
  }

  private async loadSettings(): Promise<void> {
    try {
      const data = await fs.readFile(this.settingsFile, 'utf-8');
      const settings = JSON.parse(data);
      Object.entries(settings).forEach(([key, value]) => {
        this.settings.set(key, value);
      });
      this.logger.info('Settings loaded successfully', 'settings');
    } catch (error) {
      this.logger.error('Failed to load settings', 'settings');
      // Initialize with default settings
      this.initializeDefaultSettings();
    }
  }

  private initializeDefaultSettings(): void {
    this.settings.set('backup.enabled', true);
    this.settings.set('backup.schedule', '0 0 * * *');
    this.settings.set('backup.retentionDays', 30);
    this.settings.set('backup.path', './backups');
    this.settings.set('backup.includeDatabases', true);
    this.settings.set('backup.includeFiles', true);
    this.settings.set('backup.includeLogs', true);
    this.settings.set('backup.compression', true);
    this.settings.set('backup.encryption', true);
    this.settings.set('database.postgres', {
      host: 'localhost',
      port: 5432,
      database: 'sports_betting',
      username: 'postgres',
      password: '',
    });
    this.settings.set('database.redis', {
      host: 'localhost',
      port: 6379,
      password: '',
    });
  }

  public get<T>(key: string, defaultValue: T): T {
    const value = this.settings.get(key);
    return value !== undefined ? (value as T) : defaultValue;
  }

  public set<T>(key: string, value: T): void {
    this.settings.set(key, value);
    this.saveSettings();
  }

  private async saveSettings(): Promise<void> {
    try {
      const settings = Object.fromEntries(this.settings);
      await fs.mkdir(path.dirname(this.settingsFile), { recursive: true });
      await fs.writeFile(this.settingsFile, JSON.stringify(settings, null, 2));
      this.logger.info('Settings saved successfully', 'settings');
    } catch (error) {
      this.logger.error('Failed to save settings', 'settings');
    }
  }
}
