import { EventEmitter } from 'events';
import { ArbitrageOpportunity } from '../../types/betting';
import { LineShoppingResult } from '../../types/betting';

export interface Notification {
  id: string;
  type: 'arbitrage' | 'lineShopping' | 'modelUpdate' | 'system';
  title: string;
  message: string;
  priority: 'low' | 'medium' | 'high';
  timestamp: number;
  data?: any;
  read: boolean;
}

export interface NotificationPreferences {
  arbitrage: boolean;
  lineShopping: boolean;
  modelUpdates: boolean;
  systemAlerts: boolean;
  minProfitThreshold: number;
  minConfidenceThreshold: number;
  quietHours: {
    enabled: boolean;
    start: number; // 0-23
    end: number; // 0-23
  };
}

export class NotificationManager extends EventEmitter {
  private notifications: Map<string, Notification> = new Map();
  private preferences: NotificationPreferences;
  private readonly MAX_NOTIFICATIONS = 100;

  constructor() {
    super();
    this.preferences = {
      arbitrage: true,
      lineShopping: true,
      modelUpdates: true,
      systemAlerts: true,
      minProfitThreshold: 0.5, // 0.5%
      minConfidenceThreshold: 0.7, // 70%
      quietHours: {
        enabled: false,
        start: 22, // 10 PM
        end: 7, // 7 AM
      },
    };
  }

  /**
   * Update notification preferences
   */
  public updatePreferences(preferences: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...preferences };
    this.emit('preferencesUpdated', this.preferences);
  }

  /**
   * Get current notification preferences
   */
  public getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  /**
   * Check if notifications should be sent based on quiet hours
   */
  private isWithinQuietHours(): boolean {
    if (!this.preferences.quietHours.enabled) {
      return false;
    }

    const now = new Date();
    const currentHour = now.getHours();
    const { start, end } = this.preferences.quietHours;

    if (start <= end) {
      return currentHour >= start && currentHour < end;
    } else {
      // Handles overnight quiet hours (e.g., 22:00 - 07:00)
      return currentHour >= start || currentHour < end;
    }
  }

  /**
   * Create a new notification
   */
  private createNotification(
    type: Notification['type'],
    title: string,
    message: string,
    priority: Notification['priority'],
    data?: any
  ): Notification {
    const notification: Notification = {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      title,
      message,
      priority,
      timestamp: Date.now(),
      data,
      read: false,
    };

    // Maintain maximum notification limit
    if (this.notifications.size >= this.MAX_NOTIFICATIONS) {
      const oldestNotification = Array.from(this.notifications.values()).sort(
        (a, b) => a.timestamp - b.timestamp
      )[0];
      this.notifications.delete(oldestNotification.id);
    }

    this.notifications.set(notification.id, notification);
    return notification;
  }

  /**
   * Notify about arbitrage opportunity
   */
  public notifyArbitrageOpportunity(opportunity: ArbitrageOpportunity): void {
    if (!this.preferences.arbitrage || this.isWithinQuietHours()) {
      return;
    }

    if (
      opportunity.profitMargin * 100 < this.preferences.minProfitThreshold ||
      opportunity.risk.confidence < this.preferences.minConfidenceThreshold
    ) {
      return;
    }

    const notification = this.createNotification(
      'arbitrage',
      'Arbitrage Opportunity Found',
      `Found ${opportunity.profitMargin.toFixed(2)}% profit opportunity in ${
        opportunity.legs[0].propId
      }`,
      'high',
      opportunity
    );

    this.emit('newNotification', notification);
  }

  /**
   * Notify about line shopping opportunity
   */
  public notifyLineShoppingOpportunity(result: LineShoppingResult): void {
    if (!this.preferences.lineShopping || this.isWithinQuietHours()) {
      return;
    }

    if (
      result.priceImprovement < this.preferences.minProfitThreshold ||
      result.confidence < this.preferences.minConfidenceThreshold
    ) {
      return;
    }

    const notification = this.createNotification(
      'lineShopping',
      'Better Odds Available',
      `Found ${result.priceImprovement.toFixed(2)}% better odds at ${result.bestOdds.bookmaker}`,
      'medium',
      result
    );

    this.emit('newNotification', notification);
  }

  /**
   * Notify about model updates
   */
  public notifyModelUpdate(message: string, data?: any): void {
    if (!this.preferences.modelUpdates || this.isWithinQuietHours()) {
      return;
    }

    const notification = this.createNotification(
      'modelUpdate',
      'Model Update',
      message,
      'low',
      data
    );

    this.emit('newNotification', notification);
  }

  /**
   * Notify about system alerts
   */
  public notifySystemAlert(
    title: string,
    message: string,
    priority: Notification['priority'] = 'medium'
  ): void {
    if (!this.preferences.systemAlerts || this.isWithinQuietHours()) {
      return;
    }

    const notification = this.createNotification('system', title, message, priority);

    this.emit('newNotification', notification);
  }

  /**
   * Mark notification as read
   */
  public markAsRead(notificationId: string): void {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.read = true;
      this.emit('notificationUpdated', notification);
    }
  }

  /**
   * Mark all notifications as read
   */
  public markAllAsRead(): void {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    this.emit('allNotificationsRead');
  }

  /**
   * Get all notifications
   */
  public getNotifications(): Notification[] {
    return Array.from(this.notifications.values()).sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get unread notifications
   */
  public getUnreadNotifications(): Notification[] {
    return this.getNotifications().filter(n => !n.read);
  }

  /**
   * Clear all notifications
   */
  public clearNotifications(): void {
    this.notifications.clear();
    this.emit('notificationsCleared');
  }
}
