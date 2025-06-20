import { EventMap } from '../types/core.js';

type EventHandler<T> = (data: T) => void;

export class EventBus {
  /**
   * Publishes an event to all registered handlers.
   * @param event The event object with type and payload.
   */
  public async publish<K extends keyof EventMap>(event: { type: K; payload?: EventMap[K] }): Promise<void> {
    const handlers = this.handlers.get(event.type);
    if (handlers) {
      handlers.forEach((handler) => {
        handler(event.payload!);
      });
    }
  }

  private static instance: EventBus;
  private handlers: Map<keyof EventMap, Set<EventHandler<any>>>;

  private constructor() {
    this.handlers = new Map();
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public on<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): void {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, new Set());
    }
    this.handlers.get(event)!.add(handler);
  }

  public off<K extends keyof EventMap>(event: K, handler: EventHandler<EventMap[K]>): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.delete(handler);
      if (handlers.size === 0) {
        this.handlers.delete(event);
      }
    }
  }

  public emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  public clear(): void {
    this.handlers.clear();
  }

  public getHandlerCount<K extends keyof EventMap>(event: K): number {
    return this.handlers.get(event)?.size || 0;
  }

  public hasHandlers<K extends keyof EventMap>(event: K): boolean {
    return this.handlers.has(event) && this.handlers.get(event)!.size > 0;
  }
}
