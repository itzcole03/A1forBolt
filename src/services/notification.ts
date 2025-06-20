import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';
import { ToastNotification } from '@/types';

export type NotificationType = 'info' | 'warning' | 'error' | 'success';
export type NotificationData = Record<string, any>;

@Injectable()
export class NotificationService extends EventEmitter {
  private static instance: NotificationService;
  private notifications: ToastNotification[] = [];
  private subscribers: ((notifications: ToastNotification[]) => void)[] = [];

  private constructor() {
    super();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  subscribe(callback: (notifications: ToastNotification[]) => void): () => void {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.notifications));
  }

  show(message: string, type: ToastNotification['type'] = 'info', duration: number = 5000): void {
    const notification: ToastNotification = {
      id: Date.now().toString(),
      message,
      type,
      duration,
    };

    this.notifications.push(notification);
    this.notifySubscribers();

    if (duration > 0) {
      setTimeout(() => {
        this.remove(notification.id);
      }, duration);
    }
  }

  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number): void {
    this.show(message, 'error', duration);
  }

  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }

  remove(id: string): void {
    this.notifications = this.notifications.filter(notification => notification.id !== id);
    this.notifySubscribers();
  }

  clear(): void {
    this.notifications = [];
    this.notifySubscribers();
  }

  getNotifications(): ToastNotification[] {
    return [...this.notifications];
  }

  public notify(type: NotificationType, message: string, data?: NotificationData): void {
    const notification = {
      type,
      message,
      timestamp: new Date(),
      data,
    };

    // Emit the notification event
    this.emit('notification', notification);

    // Log the notification
    console.log(`[${type.toUpperCase()}] ${message}`, data ? data : '');
  }
}

// Export a singleton instance
export const notificationService = NotificationService.getInstance();
export default notificationService;
