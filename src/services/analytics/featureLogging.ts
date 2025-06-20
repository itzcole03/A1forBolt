import { FeatureConfig, FeatureLoggerConfig } from './types';

export class FeatureLogger {
  private readonly config: FeatureLoggerConfig;

  constructor(config?: Partial<FeatureLoggerConfig>) {
    this.config = {
      logLevel: config?.logLevel || 'info',
      logFormat: config?.logFormat || 'json',
      logOutput: config?.logOutput || 'console',
      logFile: config?.logFile || 'feature-engineering.log',
      maxLogSize: config?.maxLogSize || 10 * 1024 * 1024, // 10MB
      maxLogFiles: config?.maxLogFiles || 5,
    };
  }

  public info(message: string, data?: any): void {
    this.log('info', message, data);
  }

  public warn(message: string, data?: any): void {
    this.log('warn', message, data);
  }

  public error(message: string, error?: any): void {
    this.log('error', message, error);
  }

  public debug(message: string, data?: any): void {
    this.log('debug', message, data);
  }

  private log(level: string, message: string, data?: any): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const logEntry = this.createLogEntry(level, message, data);
    const formattedLog = this.formatLog(logEntry);

    this.writeLog(formattedLog);
  }

  private shouldLog(level: string): boolean {
    const levels = ['error', 'warn', 'info', 'debug'];
    const currentLevelIndex = levels.indexOf(this.config.logLevel);
    const targetLevelIndex = levels.indexOf(level);

    return targetLevelIndex <= currentLevelIndex;
  }

  private createLogEntry(level: string, message: string, data?: any): any {
    const timestamp = new Date().toISOString();
    const entry: any = {
      timestamp,
      level,
      message,
    };

    if (data) {
      if (data instanceof Error) {
        entry.error = {
          name: data.name,
          message: data.message,
          stack: data.stack,
        };
      } else {
        entry.data = data;
      }
    }

    return entry;
  }

  private formatLog(entry: any): string {
    if (this.config.logFormat === 'json') {
      return JSON.stringify(entry);
    }

    // Simple text format
    const timestamp = entry.timestamp;
    const level = entry.level.toUpperCase();
    const message = entry.message;
    let formatted = `[${timestamp}] ${level}: ${message}`;

    if (entry.error) {
      formatted += `\nError: ${entry.error.name}: ${entry.error.message}`;
      if (entry.error.stack) {
        formatted += `\nStack: ${entry.error.stack}`;
      }
    } else if (entry.data) {
      formatted += `\nData: ${JSON.stringify(entry.data, null, 2)}`;
    }

    return formatted;
  }

  private writeLog(formattedLog: string): void {
    if (this.config.logOutput === 'console') {
      this.writeToConsole(formattedLog);
    } else if (this.config.logOutput === 'file') {
      this.writeToFile(formattedLog);
    }
  }

  private writeToConsole(formattedLog: string): void {
    const level = formattedLog.includes('ERROR')
      ? 'error'
      : formattedLog.includes('WARN')
        ? 'warn'
        : formattedLog.includes('DEBUG')
          ? 'debug'
          : 'info';

    switch (level) {
      case 'error':
        console.error(formattedLog);
        break;
      case 'warn':
        console.warn(formattedLog);
        break;
      case 'debug':
        console.debug(formattedLog);
        break;
      default:
        console.log(formattedLog);
    }
  }

  private writeToFile(formattedLog: string): void {
    // This is a placeholder implementation
    // In a real application, implement file writing with rotation
    console.log(`[FILE] ${formattedLog}`);
  }

  public getLogLevel(): string {
    return this.config.logLevel;
  }

  public setLogLevel(level: FeatureLoggerConfig['logLevel']): void {
    this.config.logLevel = level;
  }

  public getLogFormat(): string {
    return this.config.logFormat;
  }

  public setLogFormat(format: FeatureLoggerConfig['logFormat']): void {
    this.config.logFormat = format;
  }

  public getLogOutput(): string {
    return this.config.logOutput;
  }

  public setLogOutput(output: FeatureLoggerConfig['logOutput']): void {
    this.config.logOutput = output;
  }
}
