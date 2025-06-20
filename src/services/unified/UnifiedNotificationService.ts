import { BaseService } from './BaseService';
import { UnifiedServiceRegistry } from './UnifiedServiceRegistry';
import { UnifiedErrorService } from './UnifiedErrorService';
import { UnifiedStateService } from './UnifiedStateService';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  message: string;
  title?: string;
  timestamp: number;
  read: boolean;
  data?: Record<string, any>;
}

export interface NotificationOptions {
  title?: string;
  duration?: number;
  data?: Record<string, any>;
  sound?: boolean;
  priority?: 'low' | 'normal' | 'high';
}

export class UnifiedNotificationService extends BaseService {
  private errorService: UnifiedErrorService;
  private stateService: UnifiedStateService;
  private readonly defaultDuration: number = 5000;
  private readonly maxNotifications: number = 100;

  constructor(registry: UnifiedServiceRegistry) {
    super('notification', registry);
    const errorService = registry.getService('error');
    const stateService = registry.getService('state');
    if (!errorService || !stateService) {
      throw new Error('Required services not found in registry');
    }
    this.errorService = errorService as unknown as UnifiedErrorService;
    this.stateService = stateService as unknown as UnifiedStateService;
  }

  notifyUser(
    notification: Omit<Notification, 'id' | 'timestamp' | 'read'>,
    options: NotificationOptions = {}
  ): void {
    try {
      const newNotification: Notification = {
        ...notification,
        id: this.generateId(),
        timestamp: Date.now(),
        read: false,
      };

      // Add to state
      const currentNotifications = this.stateService.getState().notifications;
      const updatedNotifications = [newNotification, ...currentNotifications].slice(
        0,
        this.maxNotifications
      );

      this.stateService.setState({ notifications: updatedNotifications });

      // Play sound if enabled
      if (options.sound && this.stateService.getState().settings.sound) {
        this.playNotificationSound(notification.type);
      }

      // Auto-dismiss if duration is specified
      if (options.duration !== 0) {
        setTimeout(() => {
          this.dismissNotification(newNotification.id);
        }, options.duration || this.defaultDuration);
      }
    } catch (error) {
      this.errorService.handleError(error, {
        code: 'NOTIFICATION_ERROR',
        source: 'UnifiedNotificationService',
        details: { method: 'notifyUser', notification, options },
      });
    }
  }

  dismissNotification(notificationId: string): void {
    try {
      const currentNotifications = this.stateService.getState().notifications;
      const updatedNotifications = currentNotifications.filter(
        notification => notification.id !== notificationId
      );

      this.stateService.setState({ notifications: updatedNotifications });
    } catch (error) {
      this.errorService.handleError(error, {
        code: 'NOTIFICATION_ERROR',
        source: 'UnifiedNotificationService',
        details: { method: 'dismissNotification', notificationId },
      });
    }
  }

  markAsRead(notificationId: string): void {
    try {
      const currentNotifications = this.stateService.getState().notifications;
      const updatedNotifications = currentNotifications.map(notification =>
        notification.id === notificationId ? { ...notification, read: true } : notification
      );

      this.stateService.setState({ notifications: updatedNotifications });
    } catch (error) {
      this.errorService.handleError(error, {
        code: 'NOTIFICATION_ERROR',
        source: 'UnifiedNotificationService',
        details: { method: 'markAsRead', notificationId },
      });
    }
  }

  clearAll(): void {
    try {
      this.stateService.setState({ notifications: [] });
    } catch (error) {
      this.errorService.handleError(error, {
        code: 'NOTIFICATION_ERROR',
        source: 'UnifiedNotificationService',
        details: { method: 'clearAll' },
      });
    }
  }

  getUnreadCount(): number {
    try {
      return this.stateService.getState().notifications.filter(notification => !notification.read)
        .length;
    } catch (error) {
      this.errorService.handleError(error, {
        code: 'NOTIFICATION_ERROR',
        source: 'UnifiedNotificationService',
        details: { method: 'getUnreadCount' },
      });
      return 0;
    }
  }

  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private playNotificationSound(type: Notification['type']): void {
    try {
      const audio = new Audio();
      switch (type) {
        case 'success':
          audio.src = '/sounds/success.mp3';
          break;
        case 'error':
          audio.src = '/sounds/error.mp3';
          break;
        case 'warning':
          audio.src = '/sounds/warning.mp3';
          break;
        default:
          audio.src = '/sounds/info.mp3';
      }
      audio.play().catch(error => {
        this.errorService.handleError(error, {
          code: 'NOTIFICATION_ERROR',
          source: 'UnifiedNotificationService',
          details: { method: 'playNotificationSound', type },
        });
      });
    } catch (error) {
      this.errorService.handleError(error, {
        code: 'NOTIFICATION_ERROR',
        source: 'UnifiedNotificationService',
        details: { method: 'playNotificationSound', type },
      });
    }
  }

  notify(type: NotificationType, message: string): void {
    const notification: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      message,
      timestamp: Date.now(),
      read: false,
    };

    // Log notification
    this.logger.info(`Notification [${type}]: ${message}`);
  }
}
