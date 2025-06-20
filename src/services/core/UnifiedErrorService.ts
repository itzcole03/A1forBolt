import { UnifiedLogger } from './UnifiedLogger';
import { UnifiedServiceRegistry } from '../unified/UnifiedServiceRegistry';
import { UnifiedNotificationService } from './UnifiedNotificationService';

export interface ErrorContext {
  code: string;
  message: string;
  details?: any;
  timestamp: number;
  component?: string;
  action?: string;
  user?: string;
  stack?: string;
}

export class UnifiedErrorService {
  private static instance: UnifiedErrorService;
  private logger: UnifiedLogger;
  private notificationService: UnifiedNotificationService;
  private errorCount: Map<string, number>;
  private readonly MAX_ERRORS_PER_MINUTE = 10;

  private constructor(registry: UnifiedServiceRegistry) {
    this.logger = UnifiedLogger.getInstance();
    this.notificationService = UnifiedNotificationService.getInstance(registry);
    this.errorCount = new Map();
    this.startErrorCountReset();
  }

  public static getInstance(registry: UnifiedServiceRegistry): UnifiedErrorService {
    if (!UnifiedErrorService.instance) {
      UnifiedErrorService.instance = new UnifiedErrorService(registry);
    }
    return UnifiedErrorService.instance;
  }

  private startErrorCountReset(): void {
    setInterval(() => {
      this.errorCount.clear();
    }, 60000); // Reset every minute
  }

  public handleError(error: unknown, component: string, action: string): void {
    const errorContext: ErrorContext = {
      code: this.getErrorCode(error),
      message: this.getErrorMessage(error),
      details: this.getErrorDetails(error),
      timestamp: Date.now(),
      component,
      action,
      stack: error instanceof Error ? error.stack : undefined,
    };

    // Log the error
    this.logger.error(
      `Error in ${component} during ${action}: ${errorContext.message}`,
      'error',
      errorContext
    );

    // Check error rate
    const errorKey = `${component}:${action}`;
    const currentCount = (this.errorCount.get(errorKey) || 0) + 1;
    this.errorCount.set(errorKey, currentCount);

    // Send notification if error rate exceeds threshold
    if (currentCount >= this.MAX_ERRORS_PER_MINUTE) {
      this.notificationService.sendNotification({
        type: 'error',
        title: 'High Error Rate Detected',
        message: `Component: ${component}, Action: ${action}, Count: ${currentCount}`,
        severity: 'high',
        timestamp: Date.now(),
      });
    }
  }

  private getErrorCode(error: unknown): string {
    if (error instanceof Error) {
      return error.name;
    }
    return 'UNKNOWN_ERROR';
  }

  private getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }
    return String(error);
  }

  private getErrorDetails(error: unknown): any {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }
    return { error: String(error) };
  }

  public getErrorCount(component: string, action: string): number {
    return this.errorCount.get(`${component}:${action}`) || 0;
  }

  public resetErrorCount(component: string, action: string): void {
    this.errorCount.delete(`${component}:${action}`);
  }

  public clearAllErrorCounts(): void {
    this.errorCount.clear();
  }
}
