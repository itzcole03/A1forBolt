import { UnifiedLogger } from './UnifiedLogger';
import { SystemError } from './UnifiedError';

export class UnifiedErrorHandler {
  private static instance: UnifiedErrorHandler;
  private logger: UnifiedLogger;
  private errorLog: Array<{
    timestamp: string;
    error: Error;
    context: string;
    metadata: Record<string, any>;
  }>;

  private constructor() {
    this.logger = UnifiedLogger.getInstance();
    this.errorLog = [];
  }

  public static getInstance(): UnifiedErrorHandler {
    if (!UnifiedErrorHandler.instance) {
      UnifiedErrorHandler.instance = new UnifiedErrorHandler();
    }
    return UnifiedErrorHandler.instance;
  }

  public handleError(error: Error, context: string, metadata: Record<string, any> = {}): void {
    try {
      const timestamp = new Date().toISOString();
      this.errorLog.push({
        timestamp,
        error,
        context,
        metadata,
      });

      if (error instanceof SystemError) {
        this.logger.error(`[${error.code}] ${error.message}`, {
          context,
          metadata,
          error: error.toJSON(),
        });
      } else {
        this.logger.error(error.message, {
          context,
          metadata,
          error: {
            name: error.name,
            message: error.message,
            stack: error.stack,
          },
        });
      }
    } catch (handlingError) {
      console.error('Error in error handler:', handlingError);
      console.error('Original error:', error);
    }
  }

  public getErrorLog(): Array<{
    timestamp: string;
    error: Error;
    context: string;
    metadata: Record<string, any>;
  }> {
    return [...this.errorLog];
  }

  public clearErrorLog(): void {
    this.errorLog = [];
    this.logger.debug('Error log cleared');
  }
}
