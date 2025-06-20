import EventEmitter from 'eventemitter3';

// Minimal EventTypes for EventBus
export interface EventTypes {
  [event: string]: unknown;
}

export class EventBus {
  private static instance: EventBus;
  private emitter: any; // eventemitter3 v4+ workaround

  private constructor() {
    this.emitter = new (EventEmitter as any)();
  }

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public on<K extends keyof EventTypes & (string | symbol)>(event: K, listener: (data: EventTypes[K]) => void): void {
    this.emitter.on(event as string | symbol, listener);
  }

  public once<K extends keyof EventTypes & (string | symbol)>(event: K, listener: (data: EventTypes[K]) => void): void {
    this.emitter.once(event as string | symbol, listener);
  }

  public off<K extends keyof EventTypes & (string | symbol)>(event: K, listener: (data: EventTypes[K]) => void): void {
    this.emitter.off(event as string | symbol, listener);
  }

  public emit<K extends keyof EventTypes & (string | symbol)>(event: K, data: EventTypes[K]): void {
    this.emitter.emit(event as string | symbol, data);
  }

  public removeAllListeners<K extends keyof EventTypes & (string | symbol)>(event?: K): void {
    this.emitter.removeAllListeners(event as string | symbol | undefined);
  }

  public listenerCount<K extends keyof EventTypes & (string | symbol)>(event: K): number {
    return this.emitter.listenerCount(event as string | symbol);
  }

  public listeners<K extends keyof EventTypes & (string | symbol)>(event: K): Array<(data: EventTypes[K]) => void> {
    return this.emitter.listeners(event as string | symbol) as Array<(data: EventTypes[K]) => void>;
  }

  public eventNames(): Array<keyof EventTypes> {
    return this.emitter.eventNames() as Array<keyof EventTypes>;
  }

  // Add onAny/offAny methods for DebugPanel
  public onAny(listener: (eventName: string, data: any) => void): void {
    this.emitter.onAny(listener);
  }

  public offAny(listener: (eventName: string, data: any) => void): void {
    this.emitter.offAny(listener);
  }
}

// Singleton instance for convenience
export const eventBus = EventBus.getInstance();