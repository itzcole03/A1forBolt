
import { UnifiedErrorService } from './UnifiedErrorService.js';
import { UnifiedAnalyticsService } from './UnifiedAnalyticsService.js';
import { UnifiedBettingService } from './UnifiedBettingService.js';
import { UnifiedPredictionService } from './UnifiedPredictionService.js';
import { UnifiedStateService } from './UnifiedStateService.js';
import { UnifiedWebSocketService } from './UnifiedWebSocketService.js';
import { UnifiedNotificationService } from './UnifiedNotificationService.js';

import { UnifiedLogger } from '../unified/UnifiedLogger.js';


import { WebSocketMessage } from '../../types/webSocket.js';
type EventHandler = (data: WebSocketMessage['data']) => void;
type EventMap = Map<string, Set<EventHandler>>;

export class UnifiedServiceRegistry {
  private static instance: UnifiedServiceRegistry;
  private services: Map<string, unknown>;
  private eventHandlers: EventMap = new Map();
  private logger: UnifiedLogger;

  private constructor() {
    this.services = new Map();
    this.logger = UnifiedLogger.getInstance();
    this.initializeServices();
  }

  public static getInstance(): UnifiedServiceRegistry {
    if (!UnifiedServiceRegistry.instance) {
      UnifiedServiceRegistry.instance = new UnifiedServiceRegistry();
    }
    return UnifiedServiceRegistry.instance;
  }

  private initializeServices(): void {
    // Initialize core services first
    const errorService = UnifiedErrorService.getInstance(this);
    this.services.set('error', errorService);

    // Initialize other services
    this.services.set('analytics', new UnifiedAnalyticsService(this));
    this.services.set('betting', UnifiedBettingService.getInstance(this));
    this.services.set('prediction', UnifiedPredictionService.getInstance(this));
    this.services.set('state', new UnifiedStateService(this));
    this.services.set('websocket', new UnifiedWebSocketService('/ws', undefined, this));
    this.services.set('notification', new UnifiedNotificationService(this));
  }

  public registerService<T>(name: string, service: T): void {
    this.services.set(name, service);
  }

  public getService<T>(name: string): T | undefined {
    return this.services.get(name) as T | undefined;
  }

  public hasService(name: string): boolean {
    return this.services.has(name);
  }

  public removeService(name: string): void {
    this.services.delete(name);
  }

  public getServiceNames(): string[] {
    return Array.from(this.services.keys());
  }

  public async initialize(): Promise<void> {
    this.logger.info('Initializing service registry', 'UnifiedServiceRegistry');
    // Initialize all registered services
    for (const service of this.services.values()) {
      try {
        await (service as { initialize?: () => Promise<void> }).initialize?.();
      } catch (error) {
        this.logger.error(
          `Error initializing service ${(service as { constructor: { name: string } }).constructor.name}`,
          'UnifiedServiceRegistry',
          error
        );
      }
    }
  }

  public async cleanup(): Promise<void> {
    this.logger.info('Cleaning up service registry', 'UnifiedServiceRegistry');
    // Clean up all registered services
    for (const service of this.services.values()) {
      try {
        await (service as { cleanup?: () => Promise<void> }).cleanup?.();
      } catch (error) {
        this.logger.error(
          `Error cleaning up service ${(service as { constructor: { name: string } }).constructor.name}`,
          'UnifiedServiceRegistry',
          error
        );
      }
    }
    this.services.clear();
    this.eventHandlers.clear();
  }

  on(event: string, handler: EventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, new Set());
    }
    this.eventHandlers.get(event)!.add(handler);
  }

  off(event: string, handler: EventHandler): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.eventHandlers.delete(event);
      }
    }
  }

  emit(event: string, data: WebSocketMessage['data'] | unknown): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          this.logger.error(`Error in event handler for ${event}`, 'UnifiedServiceRegistry', error);
        }
      });
    }
  }

  getServices(): Map<string, unknown> {
    return new Map(this.services);
  }
}
