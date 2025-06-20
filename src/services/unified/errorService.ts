import UnifiedNotificationService from './notificationService';
import UnifiedSettingsService from './settingsService';

interface ErrorDetails {
  code: string;
  message: string;
  stack?: string;
  timestamp: number;
  source: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  context?: any;
}

interface ErrorConfig {
  logToConsole: boolean;
  showNotifications: boolean;
  reportToServer: boolean;
  maxStoredErrors: number;
  autoClearInterval: number;
}

class UnifiedErrorService {
  private static instance: UnifiedErrorService | null = null;
  private readonly notificationService: UnifiedNotificationService;
  private readonly settingsService: UnifiedSettingsService;
  private errors: ErrorDetails[] = [];
  private readonly STORAGE_KEY = 'esa_errors';
  private readonly MAX_ERRORS = 100;

  private config: ErrorConfig = {
    logToConsole: true,
    showNotifications: true,
    reportToServer: true,
    maxStoredErrors: 100,
    autoClearInterval: 24 * 60 * 60 * 1000, // 24 hours
  };

  protected constructor() {
    this.notificationService = UnifiedNotificationService.getInstance();
    this.settingsService = UnifiedSettingsService.getInstance();
    this.loadErrors();
    this.setupAutoClear();
  }

  public static getInstance(): UnifiedErrorService {
    if (!UnifiedErrorService.instance) {
      UnifiedErrorService.instance = new UnifiedErrorService();
    }
    return UnifiedErrorService.instance;
  }

  private loadErrors(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.errors = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading stored errors:', error);
      this.errors = [];
    }
  }

  private saveErrors(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.errors));
    } catch (error) {
      console.error('Error saving errors:', error);
    }
  }

  private setupAutoClear(): void {
    setInterval(() => {
      this.clearOldErrors(this.config.autoClearInterval);
    }, this.config.autoClearInterval);
  }

  public handleError(
    error: Error | string,
    source: string,
    severity: ErrorDetails['severity'] = 'medium',
    context?: any
  ): void {
    const errorDetails: ErrorDetails = {
      code: this.generateErrorCode(error),
      message: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: Date.now(),
      source,
      severity,
      context,
    };

    // Store error
    this.errors.unshift(errorDetails);
    if (this.errors.length > this.config.maxStoredErrors) {
      this.errors = this.errors.slice(0, this.config.maxStoredErrors);
    }
    this.saveErrors();

    // Log to console if enabled
    if (this.config.logToConsole) {
      this.logToConsole(errorDetails);
    }

    // Show notification if enabled
    if (this.config.showNotifications) {
      this.showNotification(errorDetails);
    }

    // Report to server if enabled
    if (this.config.reportToServer) {
      this.reportToServer(errorDetails);
    }

    // Dispatch error event
    this.dispatchErrorEvent(errorDetails);
  }

  private generateErrorCode(error: Error | string): string {
    const prefix = 'ESA';
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 5);
    return `${prefix}-${timestamp}-${random}`;
  }

  private logToConsole(error: ErrorDetails): void {
    const isDebug = this.settingsService.isDebugMode();
    const logMethod = error.severity === 'critical' ? 'error' : 'warn';

    if (isDebug) {
      console[logMethod]('Error Details:', {
        code: error.code,
        message: error.message,
        source: error.source,
        severity: error.severity,
        context: error.context,
        stack: error.stack,
      });
    } else {
      console[logMethod](`[${error.code}] ${error.message}`);
    }
  }

  private showNotification(error: ErrorDetails): void {
    const message = `[${error.code}] ${error.message}`;
    const title = `Error in ${error.source}`;

    switch (error.severity) {
      case 'critical':
        this.notificationService.notify('error', message, title, error);
        break;
      case 'high':
        this.notificationService.notify('error', message, title, error);
        break;
      case 'medium':
        this.notificationService.notify('warning', message, title, error);
        break;
      case 'low':
        this.notificationService.notify('info', message, title, error);
        break;
    }
  }

  private async reportToServer(error: ErrorDetails): Promise<void> {
    try {
      const settings = this.settingsService.getSettings();
      const response = await fetch(`${settings.apiUrl}/api/errors`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(error),
      });

      if (!response.ok) {
        throw new Error('Failed to report error to server');
      }
    } catch (error) {
      console.error('Error reporting to server:', error);
    }
  }

  private dispatchErrorEvent(error: ErrorDetails): void {
    const event = new CustomEvent('error', {
      detail: error,
    });
    window.dispatchEvent(event);
  }

  public getErrors(): ErrorDetails[] {
    return [...this.errors];
  }

  public getErrorsBySeverity(severity: ErrorDetails['severity']): ErrorDetails[] {
    return this.errors.filter(error => error.severity === severity);
  }

  public getErrorsBySource(source: string): ErrorDetails[] {
    return this.errors.filter(error => error.source === source);
  }

  public clearErrors(): void {
    this.errors = [];
    this.saveErrors();
  }

  public clearOldErrors(maxAge: number): void {
    const cutoff = Date.now() - maxAge;
    this.errors = this.errors.filter(error => error.timestamp > cutoff);
    this.saveErrors();
  }

  public updateConfig(config: Partial<ErrorConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public getConfig(): ErrorConfig {
    return { ...this.config };
  }
}

export default UnifiedErrorService;
