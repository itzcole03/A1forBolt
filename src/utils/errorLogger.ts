import { toast } from 'react-toastify';

export interface ErrorLog {
  timestamp: string;
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  severity: 'error' | 'warning' | 'info';
}

class ErrorLogger {
  private static instance: ErrorLogger | null = null;
  private logs: ErrorLog[] = [];
  private readonly maxLogs: number = 1000;

  private constructor() {
    // Initialize error handlers
    this.setupGlobalErrorHandlers();
  }

  public static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', event => {
      this.logError(event.reason, {
        type: 'unhandledRejection',
        context: event,
      });
    });

    // Handle uncaught errors
    window.addEventListener('error', event => {
      this.logError(event.error || new Error(event.message), {
        type: 'uncaughtError',
        context: event,
      });
    });
  }

  public logError(error: Error | string, context?: Record<string, unknown>): void {
    const errorLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      context,
      severity: 'error',
    };

    this.addLog(errorLog);
    this.notifyUser(errorLog);
  }

  public logWarning(message: string, context?: Record<string, unknown>): void {
    const warningLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      message,
      context,
      severity: 'warning',
    };

    this.addLog(warningLog);
    this.notifyUser(warningLog);
  }

  public logInfo(message: string, context?: Record<string, unknown>): void {
    const infoLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      message,
      context,
      severity: 'info',
    };

    this.addLog(infoLog);
  }

  private addLog(log: ErrorLog): void {
    this.logs.unshift(log);

    // Maintain log size limit
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    // Send to backend if needed
    this.sendToBackend(log);
  }

  private notifyUser(log: ErrorLog): void {
    switch (log.severity) {
      case 'error':
        toast.error(log.message);
        break;
      case 'warning':
        toast.warning(log.message);
        break;
      case 'info':
        toast.info(log.message);
        break;
    }
  }

  private async sendToBackend(log: ErrorLog): Promise<void> {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(log),
      });
    } catch (error) {
      console.error('Failed to send log to backend:', error);
    }
  }

  public getLogs(): ErrorLog[] {
    return [...this.logs];
  }

  public clearLogs(): void {
    this.logs = [];
  }

  public getLogsBySeverity(severity: ErrorLog['severity']): ErrorLog[] {
    return this.logs.filter(log => log.severity === severity);
  }

  public getRecentLogs(count: number): ErrorLog[] {
    return this.logs.slice(0, count);
  }
}

export const errorLogger = ErrorLogger.getInstance();
