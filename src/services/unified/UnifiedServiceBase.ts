import UnifiedErrorService from './errorService';
import UnifiedNotificationService from './notificationService';
import UnifiedLoggingService from './loggingService';
import UnifiedSettingsService from './settingsService';
import { UnifiedServiceRegistry } from './UnifiedServiceRegistry';

export abstract class UnifiedServiceBase {
  protected readonly errorService: UnifiedErrorService;
  protected readonly notificationService: UnifiedNotificationService;
  protected readonly loggingService: UnifiedLoggingService;
  protected readonly settingsService: UnifiedSettingsService;
  protected readonly serviceRegistry: UnifiedServiceRegistry;

  protected constructor(serviceName: string, registry: UnifiedServiceRegistry) {
    this.serviceRegistry = registry;
    this.errorService = UnifiedErrorService.getInstance(registry);
    this.notificationService = UnifiedNotificationService.getInstance(registry);
    this.loggingService = UnifiedLoggingService.getInstance(registry);
    this.settingsService = UnifiedSettingsService.getInstance(registry);
    this.loggingService.info(`Initializing ${serviceName}`, serviceName);
  }

  protected async handleServiceOperation<T>(
    operation: () => Promise<T>,
    operationName: string,
    serviceName: string,
    successMessage?: string,
    errorMessage?: string
  ): Promise<T> {
    try {
      this.loggingService.debug(`Starting ${operationName}`, serviceName);
      const result = await operation();

      if (successMessage) {
        this.notificationService.notify('success', successMessage);
      }

      this.loggingService.info(`Completed ${operationName}`, serviceName);
      return result;
    } catch (error) {
      const errorMsg = errorMessage || `Failed to ${operationName}`;
      this.errorService.handleError(
        error instanceof Error ? error : new Error(errorMsg),
        serviceName,
        'high',
        { operation: operationName }
      );
      this.notificationService.notify('error', errorMsg);
      throw error;
    }
  }

  protected handleWebSocketError(error: any, serviceName: string, context?: any): void {
    this.errorService.handleError(
      error instanceof Error ? error : new Error('WebSocket error occurred'),
      serviceName,
      'high',
      { ...context, type: 'websocket' }
    );
  }

  protected logOperation(
    level: 'debug' | 'info' | 'warn' | 'error',
    message: string,
    serviceName: string,
    data?: any
  ): void {
    this.loggingService.log(level, message, serviceName, data);
  }

  // Lifecycle methods
  async initialize(): Promise<void> {
    this.loggingService.info(`Initializing service`, this.constructor.name);
  }

  async cleanup(): Promise<void> {
    this.loggingService.info(`Cleaning up service`, this.constructor.name);
  }

  // Cache management
  protected getCacheKey(...parts: (string | number)[]): string {
    return `${this.constructor.name}:${parts.join(':')}`;
  }

  // Service registry helpers
  protected getService<T>(name: string): T | undefined {
    return this.serviceRegistry.getService<T>(name);
  }

  protected emit(event: string, data: any): void {
    this.serviceRegistry.emit(event, data);
  }
}
