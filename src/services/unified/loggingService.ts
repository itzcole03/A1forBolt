import UnifiedSettingsService from './settingsService';
import UnifiedErrorService from './errorService';

interface LogEntry {
  id: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: number;
  source: string;
  data?: any;
  tags?: string[];
}

interface LogConfig {
  enabled: boolean;
  minLevel: LogEntry['level'];
  maxEntries: number;
  persistToStorage: boolean;
  consoleOutput: boolean;
  serverOutput: boolean;
  autoClearInterval: number;
  tags: string[];
}

class UnifiedLoggingService {
  private static instance: UnifiedLoggingService | null = null;
  private readonly settingsService: UnifiedSettingsService;
  private readonly errorService: UnifiedErrorService;
  private logs: LogEntry[] = [];
  private readonly STORAGE_KEY = 'esa_logs';
  private readonly MAX_LOGS = 1000;

  private config: LogConfig = {
    enabled: true,
    minLevel: 'info',
    maxEntries: 1000,
    persistToStorage: true,
    consoleOutput: true,
    serverOutput: true,
    autoClearInterval: 24 * 60 * 60 * 1000, // 24 hours
    tags: ['app', 'user', 'betting', 'prediction', 'analytics'],
  };

  protected constructor() {
    this.settingsService = UnifiedSettingsService.getInstance();
    this.errorService = UnifiedErrorService.getInstance();
    this.loadLogs();
    this.setupAutoClear();
  }

  public static getInstance(): UnifiedLoggingService {
    if (!UnifiedLoggingService.instance) {
      UnifiedLoggingService.instance = new UnifiedLoggingService();
    }
    return UnifiedLoggingService.instance;
  }

  private loadLogs(): void {
    if (!this.config.persistToStorage) return;

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (error: unknown) {
      this.errorService.handleError(
        error instanceof Error ? error : new Error('Failed to load logs'),
        'LoggingService',
        'low',
        { action: 'loadLogs' }
      );
      this.logs = [];
    }
  }

  private saveLogs(): void {
    if (!this.config.persistToStorage) return;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.logs));
    } catch (error: unknown) {
      this.errorService.handleError(
        error instanceof Error ? error : new Error('Failed to save logs'),
        'LoggingService',
        'low',
        { action: 'saveLogs' }
      );
    }
  }

  private setupAutoClear(): void {
    setInterval(() => {
      this.clearOldLogs(this.config.autoClearInterval);
    }, this.config.autoClearInterval);
  }

  private createLogEntry(
    level: LogEntry['level'],
    message: string,
    source: string,
    data?: any,
    tags?: string[]
  ): LogEntry {
    return {
      id: this.generateLogId(),
      level,
      message,
      timestamp: Date.now(),
      source,
      data,
      tags: tags || [],
    };
  }

  private generateLogId(): string {
    return `LOG-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  }

  private shouldLog(level: LogEntry['level']): boolean {
    if (!this.config.enabled) return false;

    const levels: LogEntry['level'][] = ['debug', 'info', 'warn', 'error'];
    const minLevelIndex = levels.indexOf(this.config.minLevel);
    const currentLevelIndex = levels.indexOf(level);

    return currentLevelIndex >= minLevelIndex;
  }

  private logToConsole(entry: LogEntry): void {
    if (!this.config.consoleOutput) return;

    const isDebug = this.settingsService.isDebugMode();
    const logMethod = entry.level === 'error' ? 'error' : entry.level;

    if (isDebug) {
      console[logMethod]('Log Entry:', {
        id: entry.id,
        level: entry.level,
        message: entry.message,
        source: entry.source,
        timestamp: new Date(entry.timestamp).toISOString(),
        data: entry.data,
        tags: entry.tags,
      });
    } else {
      console[logMethod](`[${entry.source}] ${entry.message}`);
    }
  }

  private async logToServer(entry: LogEntry): Promise<void> {
    if (!this.config.serverOutput) return;

    try {
      const settings = this.settingsService.getSettings();
      const response = await fetch(`${settings.apiUrl}/api/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });

      if (!response.ok) {
        throw new Error('Failed to send log to server');
      }
    } catch (error: unknown) {
      this.errorService.handleError(
        error instanceof Error ? error : new Error('Failed to send log to server'),
        'LoggingService',
        'low',
        { action: 'logToServer', logEntry: entry }
      );
    }
  }

  public log(
    level: LogEntry['level'],
    message: string,
    source: string,
    data?: any,
    tags?: string[]
  ): void {
    if (!this.shouldLog(level)) return;

    const entry = this.createLogEntry(level, message, source, data, tags);

    // Store log
    this.logs.unshift(entry);
    if (this.logs.length > this.config.maxEntries) {
      this.logs = this.logs.slice(0, this.config.maxEntries);
    }
    this.saveLogs();

    // Output log
    this.logToConsole(entry);
    this.logToServer(entry);

    // Dispatch log event
    this.dispatchLogEvent(entry);
  }

  private dispatchLogEvent(entry: LogEntry): void {
    const event = new CustomEvent('log', {
      detail: entry,
    });
    window.dispatchEvent(event);
  }

  public debug(message: string, source: string, data?: any, tags?: string[]): void {
    this.log('debug', message, source, data, tags);
  }

  public info(message: string, source: string, data?: any, tags?: string[]): void {
    this.log('info', message, source, data, tags);
  }

  public warn(message: string, source: string, data?: any, tags?: string[]): void {
    this.log('warn', message, source, data, tags);
  }

  public error(message: string, source: string, data?: any, tags?: string[]): void {
    this.log('error', message, source, data, tags);
  }

  public getLogs(): LogEntry[] {
    return [...this.logs];
  }

  public getLogsByLevel(level: LogEntry['level']): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  public getLogsBySource(source: string): LogEntry[] {
    return this.logs.filter(log => log.source === source);
  }

  public getLogsByTag(tag: string): LogEntry[] {
    return this.logs.filter(log => log.tags?.includes(tag));
  }

  public clearLogs(): void {
    this.logs = [];
    this.saveLogs();
  }

  public clearOldLogs(maxAge: number): void {
    const cutoff = Date.now() - maxAge;
    this.logs = this.logs.filter(log => log.timestamp > cutoff);
    this.saveLogs();
  }

  public updateConfig(config: Partial<LogConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public getConfig(): LogConfig {
    return { ...this.config };
  }
}

export default UnifiedLoggingService;
