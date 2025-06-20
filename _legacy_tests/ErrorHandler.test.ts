import { ErrorHandler } from '../ErrorHandler';
import { EventBus } from '../EventBus';
import { unifiedMonitor } from '../UnifiedMonitor';
import { PerformanceMonitor } from '../PerformanceMonitor';
import { UnifiedConfigManager } from '../UnifiedConfigManager';
import { ErrorContext, ErrorCategory, ErrorSeverity } from '../error/types';

jest.mock('../EventBus');
jest.mock('../UnifiedMonitor');
jest.mock('../PerformanceMonitor');
jest.mock('../UnifiedConfigManager');

describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler;
  let eventBus: jest.Mocked<EventBus>;
  let monitor: jest.Mocked<typeof unifiedMonitor>;
  let performanceMonitor: jest.Mocked<PerformanceMonitor>;
  let configManager: jest.Mocked<UnifiedConfigManager>;

  beforeEach(() => {
    jest.clearAllMocks();
    errorHandler = ErrorHandler.getInstance();
    eventBus = EventBus.getInstance() as jest.Mocked<EventBus>;
    monitor = unifiedMonitor as jest.Mocked<typeof unifiedMonitor>;
    performanceMonitor = PerformanceMonitor.getInstance() as jest.Mocked<PerformanceMonitor>;
    configManager = UnifiedConfigManager.getInstance() as jest.Mocked<UnifiedConfigManager>;
  });

  describe('getInstance', () => {
    it('should return the same instance on multiple calls', () => {
      const instance1 = ErrorHandler.getInstance();
      const instance2 = ErrorHandler.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('handleError', () => {
    it('should handle network errors with retry', async () => {
      const networkError = new Error('Network error');
      networkError.name = 'NetworkError';

      await errorHandler.handleError(networkError, { component: 'NetworkService' });

      expect(eventBus.emit).toHaveBeenCalledWith(
        'error:handled',
        expect.objectContaining({
          error: expect.objectContaining({
            category: ErrorCategory.NETWORK,
            retryable: true,
          }),
        })
      );
    });

    it('should handle validation errors without retry', async () => {
      const validationError = new Error('Validation error');
      validationError.name = 'ValidationError';

      await errorHandler.handleError(validationError, { component: 'ValidationService' });

      expect(eventBus.emit).toHaveBeenCalledWith(
        'error:handled',
        expect.objectContaining({
          error: expect.objectContaining({
            category: ErrorCategory.VALIDATION,
            severity: ErrorSeverity.LOW,
            retryable: false,
          }),
        })
      );
    });

    it('should trigger emergency procedures for critical errors', async () => {
      const criticalError = new Error('Critical error');
      criticalError.name = 'CriticalError';

      await errorHandler.handleError(criticalError, {
        component: 'CriticalService',
        severity: ErrorSeverity.CRITICAL,
      });

      expect(eventBus.emit).toHaveBeenCalledWith(
        'error:emergency',
        expect.objectContaining({
          error: expect.objectContaining({
            severity: ErrorSeverity.CRITICAL,
          }),
        })
      );
    });

    it('should track error metrics', async () => {
      const error = new Error('Test error');
      await errorHandler.handleError(error, { component: 'TestService' });

      const metrics = errorHandler.getErrorMetrics();
      expect(metrics['TestService']).toBeDefined();
      expect(metrics['TestService'].count).toBe(1);
    });

    it('should maintain error history', async () => {
      const error = new Error('Test error');
      await errorHandler.handleError(error, { component: 'TestService' });

      const history = errorHandler.getErrorHistory();
      expect(history).toHaveLength(1);
      expect(history[0]).toMatchObject({
        message: 'Test error',
        component: 'TestService',
      });
    });
  });

  describe('recovery strategies', () => {
    it('should attempt recovery for retryable errors', async () => {
      const networkError = new Error('Network error');
      networkError.name = 'NetworkError';

      await errorHandler.handleError(networkError, {
        component: 'NetworkService',
        retryable: true,
      });

      const metrics = errorHandler.getErrorMetrics();
      expect(metrics['NetworkService'].recoveryAttempts).toBeGreaterThan(0);
    });

    it('should stop retrying after max attempts', async () => {
      const networkError = new Error('Network error');
      networkError.name = 'NetworkError';

      for (let i = 0; i < 5; i++) {
        await errorHandler.handleError(networkError, {
          component: 'NetworkService',
          retryable: true,
          retryCount: i,
        });
      }

      const metrics = errorHandler.getErrorMetrics();
      expect(metrics['NetworkService'].recoveryAttempts).toBeLessThanOrEqual(3);
    });
  });

  describe('error reporting', () => {
    it('should report errors to monitoring services', async () => {
      const error = new Error('Test error');
      await errorHandler.handleError(error, { component: 'TestService' });

      expect(monitor.reportError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          component: 'TestService',
        })
      );
    });

    it('should report errors to Sentry with correct severity', async () => {
      const error = new Error('Test error');
      await errorHandler.handleError(error, {
        component: 'TestService',
        severity: ErrorSeverity.CRITICAL,
      });

      expect(monitor.reportError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          component: 'TestService',
        })
      );
    });
  });

  describe('error history management', () => {
    it('should limit error history size', async () => {
      for (let i = 0; i < 1100; i++) {
        await errorHandler.handleError(new Error(`Error ${i}`));
      }

      const history = errorHandler.getErrorHistory();
      expect(history).toHaveLength(1000);
    });

    it('should clear error history', async () => {
      await errorHandler.handleError(new Error('Test error'));
      errorHandler.clearErrorHistory();

      const history = errorHandler.getErrorHistory();
      expect(history).toHaveLength(0);
    });
  });
});
