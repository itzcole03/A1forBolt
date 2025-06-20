import { ErrorMetrics, EventMap } from '../types/core';
import { EventBus } from './EventBus';

export class ErrorHandler {
  private static instance: ErrorHandler;
  private errorMetrics: Map<string, ErrorMetrics>;
  private eventBus: EventBus;

  private constructor() {
    this.errorMetrics = new Map();
    this.eventBus = EventBus.getInstance();
  }

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  public handleError(error: Error, context: string): void {
    const metrics: ErrorMetrics = {
      count: (this.errorMetrics.get(context)?.count || 0) + 1,
      lastError: error,
      timestamp: Date.now(),
    };

    this.errorMetrics.set(context, metrics);
    this.eventBus.emit('error:occurred', error);
  }

  public getErrorMetrics(context: string): ErrorMetrics | undefined {
    return this.errorMetrics.get(context);
  }

  public getAllErrorMetrics(): Map<string, ErrorMetrics> {
    return new Map(this.errorMetrics);
  }

  public clearErrorMetrics(context?: string): void {
    if (context) {
      this.errorMetrics.delete(context);
    } else {
      this.errorMetrics.clear();
    }
  }

  public getErrorCount(context: string): number {
    return this.errorMetrics.get(context)?.count || 0;
  }

  public getLastError(context: string): Error | undefined {
    return this.errorMetrics.get(context)?.lastError;
  }

  public getLastErrorTimestamp(context: string): number | undefined {
    return this.errorMetrics.get(context)?.timestamp;
  }
}
