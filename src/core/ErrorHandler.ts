import { EventBus } from './EventBus.js';


export type ErrorSeverity = 'low' | 'medium' | 'high';

export interface ErrorDetails {
  action?: string;
  data?: unknown;
  [key: string]: unknown;
}

export class ErrorHandler {
  private static instance: ErrorHandler;
  private readonly eventBus: EventBus;

  private errors: Array<{
    error: Error;
    source: string;
    severity: ErrorSeverity;
    details?: ErrorDetails;
    timestamp: number;
  }>;
  private readonly MAX_ERRORS = 1000;

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.errors = [];
  }



  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  public handleError(
    error: Error | unknown,
    source: string,
    severity: ErrorSeverity = 'medium',
    details?: ErrorDetails
  ): void {
    try {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      const errorEntry = {
        error: errorObj,
        source,
        severity,
        details,
        timestamp: Date.now(),
      };

      this.errors.push(errorEntry);
      if (this.errors.length > this.MAX_ERRORS) {
        this.errors.shift();
      }

      this.eventBus.emit('error:occurred', errorEntry);

      // Log error based on severity
      switch (severity) {
        case 'high':
          console.error(`[${source}] Critical error:`, errorObj, details);
          break;
        case 'medium':
          console.warn(`[${source}] Warning:`, errorObj, details);
          break;
        case 'low':
          console.info(`[${source}] Info:`, errorObj, details);
          break;
      }

      // Handle high severity errors
      if (severity === 'high') {
        this.handleCriticalError(errorEntry);
      }
    } catch (e) {
      console.error('Error in error handler:', e);
    }
  }

  private handleCriticalError(errorEntry: {
    error: Error;
    source: string;
    severity: ErrorSeverity;
    details?: ErrorDetails;
    timestamp: number;
  }): void {
    // Implement critical error handling (e.g., notify user, retry operation, etc.)
    this.eventBus.emit('error:critical', errorEntry);
  }

  public getErrors(
    source?: string,
    severity?: ErrorSeverity,
    startTime?: number,
    endTime?: number
  ): Array<{
    error: Error;
    source: string;
    severity: ErrorSeverity;
    details?: ErrorDetails;
    timestamp: number;
  }> {
    return this.errors.filter(entry => {
      if (source && entry.source !== source) return false;
      if (severity && entry.severity !== severity) return false;
      if (startTime && entry.timestamp < startTime) return false;
      if (endTime && entry.timestamp > endTime) return false;
      return true;
    });
  }

  public clearErrors(): void {
    this.errors = [];
    this.eventBus.emit('error:cleared', null);
  }

  public getErrorCount(severity?: ErrorSeverity): number {
    return this.errors.filter(entry => !severity || entry.severity === severity).length;
  }
}
