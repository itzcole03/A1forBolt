// src/core/UnifiedState.ts

/**
 * UnifiedState
 *
 * Manages critical, low-level, cross-cutting global application state that may not fit
 * directly into Zustand stores, or is more tightly coupled with the operational state
 * of the core engines.
 *
 * ⚠️ Use with caution. Most UI-related and data-cache state should reside in Zustand stores (`useAppStore`).
 * This store is intended for specific, non-reactive or engine-internal states if absolutely necessary.
 *
 * Examples of potential use (if not handled elsewhere):
 * - System-wide flags (e.g., 'MAINTENANCE_MODE', 'INITIAL_LOAD_COMPLETE')
 * - Core engine operational status (e.g., 'PredictionEngine_STATUS: ready | degraded')
 * - Singleton service readiness flags
 */

interface CriticalStateStore {
  [key: string]: any;
}

class UnifiedStateSingleton {
  private state: CriticalStateStore = {};

  constructor() {
    // Initialize with any default critical states if necessary
    // this.state.INITIAL_LOAD_COMPLETE = false;
  }

  public set<T>(key: string, value: T): void {
    //
    this.state[key] = value;
    // Note: This is NOT reactive. UI components will not automatically update.
    // If reactivity is needed, consider Zustand or an event bus.
  }

  public get<T>(key: string, defaultValue?: T): T | undefined {
    const value = this.state[key] as T | undefined;
    return value !== undefined ? value : defaultValue;
  }

  public remove(key: string): void {
    //
    delete this.state[key];
  }

  public getAll(): Readonly<CriticalStateStore> {
    return Object.freeze({ ...this.state });
  }

  public clearAll(): void {
    this.state = {};
  }
}

// Export a singleton instance
export const unifiedState = new UnifiedStateSingleton();

// // Example Usage:
// unifiedState.set('SYSTEM_MAINTENANCE_MODE', true);
// const isInMaintenance = unifiedState.get<boolean>('SYSTEM_MAINTENANCE_MODE', false);
// if (isInMaintenance) {
//   console.warn('Application is currently in maintenance mode.');
// }
