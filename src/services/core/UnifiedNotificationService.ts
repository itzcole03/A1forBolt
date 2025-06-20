import { UnifiedLogger } from './UnifiedLogger';
import { UnifiedServiceRegistry } from '../unified/UnifiedServiceRegistry';
import { WebSocket } from 'ws';

export interface Notification {
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: number;
  metadata?: Record<string, any>;
}

export class UnifiedNotificationService {
  private static instance: UnifiedNotificationService;
  private logger: UnifiedLogger;
  private wsClients: Set<WebSocket>;
  private notificationQueue: Notification[];
  private readonly MAX_QUEUE_SIZE = 1000;

  private constructor(registry: UnifiedServiceRegistry) {
    this.logger = UnifiedLogger.getInstance();
    this.wsClients = new Set();
    this.notificationQueue = [];
  }

  public static getInstance(registry: UnifiedServiceRegistry): UnifiedNotificationService {
    if (!UnifiedNotificationService.instance) {
      UnifiedNotificationService.instance = new UnifiedNotificationService(registry);
    }
    return UnifiedNotificationService.instance;
  }

  public addWebSocketClient(ws: WebSocket): void {
    this.wsClients.add(ws);
    this.logger.info('New WebSocket client connected', 'notification');

    ws.on('close', () => {
      this.wsClients.delete(ws);
      this.logger.info('WebSocket client disconnected', 'notification');
    });
  }

  public sendNotification(notification: Notification): void {
    // Add to queue
    this.notificationQueue.push(notification);
    if (this.notificationQueue.length > this.MAX_QUEUE_SIZE) {
      this.notificationQueue.shift(); // Remove oldest notification
    }

    // Log notification
    this.logger.info(
      `Notification: ${notification.title} - ${notification.message}`,
      'notification',
      notification
    );

    // Broadcast to WebSocket clients
    this.broadcastNotification(notification);
  }

  private broadcastNotification(notification: Notification): void {
    const message = JSON.stringify(notification);
    this.wsClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  public getNotifications(count: number = 10): Notification[] {
    return this.notificationQueue.slice(-count);
  }

  public clearNotifications(): void {
    this.notificationQueue = [];
  }

  public getActiveClientsCount(): number {
    return this.wsClients.size;
  }
}
