import { UnifiedServiceRegistry } from './services/unified/UnifiedServiceRegistry';
import { UnifiedLogger } from './unified/UnifiedLogger';
import { UnifiedErrorService } from './services/unified/UnifiedErrorService';
import { UnifiedWebSocketService } from './services/unified/UnifiedWebSocketService';
import { UnifiedStateService } from './services/unified/UnifiedStateService';
import { UnifiedSettingsService } from './services/unified/UnifiedSettingsService';
import { UnifiedNotificationService } from './services/unified/UnifiedNotificationService';

export class Application {
  private static instance: Application;
  private readonly serviceRegistry: UnifiedServiceRegistry;
  private readonly logger: UnifiedLogger;
  private readonly errorService: UnifiedErrorService;
  private readonly websocketService: UnifiedWebSocketService;
  private readonly stateService: UnifiedStateService;
  private readonly settingsService: UnifiedSettingsService;
  private readonly notificationService: UnifiedNotificationService;

  private constructor() {
    this.serviceRegistry = UnifiedServiceRegistry.getInstance();
    this.logger = this.serviceRegistry.getService<UnifiedLogger>('logger');
    this.errorService = this.serviceRegistry.getService<UnifiedErrorService>('error');
    this.websocketService = this.serviceRegistry.getService<UnifiedWebSocketService>('websocket');
    this.stateService = this.serviceRegistry.getService<UnifiedStateService>('state');
    this.settingsService = this.serviceRegistry.getService<UnifiedSettingsService>('settings');
    this.notificationService =
      this.serviceRegistry.getService<UnifiedNotificationService>('notification');
  }

  public static getInstance(): Application {
    if (!Application.instance) {
      Application.instance = new Application();
    }
    return Application.instance;
  }

  public async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing application...');

      // Initialize service registry
      await this.serviceRegistry.initialize();

      // Set up error handling
      this.setupErrorHandling();

      // Set up WebSocket connection
      this.setupWebSocket();

      // Load user preferences
      await this.loadUserPreferences();

      this.logger.info('Application initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize application', { error });
      throw error;
    }
  }

  private setupErrorHandling(): void {
    // Global error handler
    window.onerror = (message, source, lineno, colno, error) => {
      this.errorService.handleError(error || message, {
        code: 'GLOBAL_ERROR',
        source: source || 'unknown',
        details: { lineno, colno },
      });
    };

    // Unhandled promise rejection handler
    window.onunhandledrejection = event => {
      this.errorService.handleError(event.reason, {
        code: 'UNHANDLED_REJECTION',
        source: 'promise',
      });
    };
  }

  private setupWebSocket(): void {
    this.websocketService.connect();

    // Handle WebSocket events
    this.websocketService.on('connection:opened', () => {
      this.logger.info('WebSocket connection established');
      this.notificationService.notify(
        'success',
        'Connection Established',
        'Real-time updates are now active'
      );
    });

    this.websocketService.on('connection:closed', () => {
      this.logger.warn('WebSocket connection closed');
      this.notificationService.notify('warning', 'Connection Lost', 'Attempting to reconnect...');
    });

    this.websocketService.on('connection:error', error => {
      this.logger.error('WebSocket error', { error });
      this.notificationService.notify(
        'error',
        'Connection Error',
        'Failed to establish real-time connection'
      );
    });
  }

  private async loadUserPreferences(): Promise<void> {
    try {
      const settings = this.settingsService.getSettings();
      this.stateService.setStateValue('preferences', settings);

      // Apply theme
      document.documentElement.setAttribute('data-theme', settings.theme);

      // Apply language
      document.documentElement.setAttribute('lang', settings.language);

      this.logger.info('User preferences loaded successfully');
    } catch (error) {
      this.logger.error('Failed to load user preferences', { error });
      throw error;
    }
  }

  public async shutdown(): Promise<void> {
    try {
      this.logger.info('Shutting down application...');

      // Shutdown service registry
      await this.serviceRegistry.shutdown();

      this.logger.info('Application shut down successfully');
    } catch (error) {
      this.logger.error('Failed to shut down application', { error });
      throw error;
    }
  }
}

// Initialize application
const app = Application.getInstance();
app.initialize().catch(error => {
  console.error('Failed to initialize application:', error);
});
