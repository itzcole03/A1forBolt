export type LogLevel = 'debug' | 'info' | 'warn' | 'error';
import { unifiedMonitor } from './UnifiedMonitor';
// import { SystemError } from '@/core/UnifiedError'; // Disabled: file not found


export interface LogContext {
  level: LogLevel;
  message: string;
  timestamp: number;
  component?: string;
  action?: string;
  details?: Record<string, any>;
  error?: Error;
}

export interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableMonitoring: boolean;
  component?: string;
  format?: (context: LogContext) => string;
}

export class UnifiedLogger {
  private static instance: UnifiedLogger;
  private config: LoggerConfig = {
    minLevel: 'info',
    enableConsole: true,
    enableMonitoring: true,
  };
  private serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  public static getInstance(serviceName: string): UnifiedLogger {
    if (!UnifiedLogger.instance) {
      UnifiedLogger.instance = new UnifiedLogger(serviceName);
    }
    return UnifiedLogger.instance;
  }

  public configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.config.minLevel);
  }

  private formatMessage(context: LogContext): string {
    if (this.config.format) {
      return this.config.format(context);
    }

    const timestamp = new Date(context.timestamp).toISOString();
    const component = context.component || this.config.component || 'system';
    const action = context.action ? ` [${context.action}]` : '';
    const details = context.details ? ` ${JSON.stringify(context.details)}` : '';
    const error = context.error ? `\nError: ${context.error.message}` : '';

    return `[${timestamp}] ${context.level.toUpperCase()} [${component}]${action}: ${context.message}${details}${error}`;
  }

  private log(context: LogContext): void {
    if (!this.shouldLog(context.level)) {
      return;
    }

    if (this.config.enableConsole) {
      const formattedMessage = this.formatMessage(context);
      switch (context.level) {
        case 'debug':
          console.debug(formattedMessage);
          break;
        case 'info':
          console.info(formattedMessage);
          break;
        case 'warn':
          console.warn(formattedMessage);
          break;
        case 'error':
          console.error(formattedMessage);
          break;
      }
    }

    if (this.config.enableMonitoring) {
      unifiedMonitor.recordMetric(`log.${context.level}`, 1, {
        component: context.component || this.config.component || 'system',
        action: context.action || 'unknown',
      });

      if (context.error) {
        const errorToReport =
          context.error;
        unifiedMonitor.reportError(errorToReport, {
          code: 'INTERNAL_ERROR',
          message: context.message,
          details: context.details,
          timestamp: context.timestamp,
          component: context.component || this.config.component,
          action: context.action,
        });
      }
    }
  }

  public debug(message: string, context?: Partial<LogContext>): void {
    this.log({
      level: 'debug',
      message,
      timestamp: Date.now(),
      ...context,
    });
  }

  public info(message: string, context?: Partial<LogContext>): void {
    this.log({
      level: 'info',
      message,
      timestamp: Date.now(),
      ...context,
    });
  }

  public warn(message: string, context?: Partial<LogContext>): void {
    this.log({
      level: 'warn',
      message,
      timestamp: Date.now(),
      ...context,
    });
  }

  public error(message: string, error?: Error, context?: Partial<LogContext>): void {
    this.log({
      level: 'error',
      message,
      timestamp: Date.now(),
      error,
      ...context,
    });
  }
}

export const unifiedLogger = UnifiedLogger.getInstance();
