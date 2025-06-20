import {
  BetRecommendation,
  BettingEvent,
  BettingAlert,
  RiskProfileType,
  UserConstraints,
  BettingMetrics,
  BettingOpportunity,
} from '@/types/betting';
import UnifiedLoggingService from './loggingService';
import UnifiedErrorService from './errorService';
import UnifiedSettingsService from './settingsService';

interface StateConfig {
  persistToStorage: boolean;
  autoSave: boolean;
  saveInterval: number;
  maxHistory: number;
  enableTimeTravel: boolean;
}

interface StateChange<T> {
  timestamp: number;
  previousState: T;
  newState: T;
  source: string;
  action: string;
}

interface BettingInterfaceState {
  bankroll: number;
  profit: number;
  riskProfile: RiskProfileType;
  userConstraints: UserConstraints;
  selectedEvent: BettingEvent | null;
  recommendations: BetRecommendation[];
  bettingOpportunities: BettingOpportunity[];
  alerts: BettingAlert[];
  performance?: BettingMetrics;
}

interface StateServiceConfig {
  initialState: BettingInterfaceState;
  storageKey: string;
}

class UnifiedStateService {
  private static instance: UnifiedStateService | null = null;
  private readonly loggingService: UnifiedLoggingService;
  private readonly errorService: UnifiedErrorService;
  private readonly settingsService: UnifiedSettingsService;
  private state: BettingInterfaceState;
  private history: StateChange<BettingInterfaceState>[] = [];
  private readonly STORAGE_KEY: string;
  private saveIntervalId?: number;
  private subscribers: Set<(state: BettingInterfaceState) => void> = new Set();

  private config: StateConfig = {
    persistToStorage: true,
    autoSave: true,
    saveInterval: 5000,
    maxHistory: 100,
    enableTimeTravel: true,
  };

  private constructor(config: StateServiceConfig) {
    this.loggingService = UnifiedLoggingService.getInstance();
    this.errorService = UnifiedErrorService.getInstance();
    this.settingsService = UnifiedSettingsService.getInstance();
    this.state = config.initialState;
    this.STORAGE_KEY = config.storageKey;
    this.setupAutoSave();
    this.loadState();
  }

  public static getInstance(config: StateServiceConfig): UnifiedStateService {
    if (!UnifiedStateService.instance) {
      UnifiedStateService.instance = new UnifiedStateService(config);
    }
    return UnifiedStateService.instance;
  }

  private loadState(): void {
    if (!this.config.persistToStorage) return;

    try {
      const savedState = localStorage.getItem(this.STORAGE_KEY);
      if (savedState) {
        this.state = JSON.parse(savedState);
      }
    } catch (error: unknown) {
      this.errorService.handleError(
        error instanceof Error ? error : new Error('Failed to load state'),
        'StateService',
        'low',
        { action: 'loadState' }
      );
    }
  }

  private saveState(): void {
    if (!this.config.persistToStorage) return;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.state));
    } catch (error: unknown) {
      this.errorService.handleError(
        error instanceof Error ? error : new Error('Failed to save state'),
        'StateService',
        'low',
        { action: 'saveState' }
      );
    }
  }

  private setupAutoSave(): void {
    if (this.config.autoSave) {
      this.saveIntervalId = window.setInterval(() => {
        this.saveState();
      }, this.config.saveInterval);
    }
  }

  private recordStateChange(
    previousState: BettingInterfaceState,
    newState: BettingInterfaceState,
    source: string,
    action: string
  ): void {
    const change: StateChange<BettingInterfaceState> = {
      timestamp: Date.now(),
      previousState,
      newState,
      source,
      action,
    };

    this.history.unshift(change);
    if (this.history.length > this.config.maxHistory) {
      this.history = this.history.slice(0, this.config.maxHistory);
    }
  }

  public getState(): BettingInterfaceState {
    return { ...this.state };
  }

  public setState(updates: Partial<BettingInterfaceState>, source: string, action: string): void {
    const previousState = { ...this.state };
    this.state = {
      ...this.state,
      ...updates,
    };

    this.recordStateChange(previousState, this.state, source, action);
    this.saveState();
    this.notifySubscribers();
  }

  public subscribe(callback: (state: BettingInterfaceState) => void): () => void {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.state));
  }

  public updateState(
    updater: (state: BettingInterfaceState) => Partial<BettingInterfaceState>,
    source: string,
    action: string = 'updateState'
  ): void {
    const previousState = { ...this.state };
    const updates = updater(this.state);
    this.state = { ...this.state, ...updates };

    this.recordStateChange(previousState, this.state, source, action);
    this.saveState();
    this.notifySubscribers();
  }

  private dispatchStateChange(
    previousState: BettingInterfaceState,
    newState: BettingInterfaceState,
    source: string,
    action: string
  ): void {
    const event = new CustomEvent('stateChange', {
      detail: {
        previousState,
        newState,
        source,
        action,
        timestamp: Date.now(),
      },
    });
    window.dispatchEvent(event);
  }

  public getHistory(): StateChange<BettingInterfaceState>[] {
    return [...this.history];
  }

  public timeTravel(index: number): void {
    if (!this.config.enableTimeTravel) {
      this.errorService.handleError(new Error('Time travel is disabled'), 'StateService', 'low');
      return;
    }

    if (index < 0 || index >= this.history.length) {
      this.errorService.handleError(new Error('Invalid history index'), 'StateService', 'low');
      return;
    }

    const targetState = this.history[index].newState;
    this.state = { ...targetState };
    this.saveState();
    this.dispatchStateChange(this.state, targetState, 'StateService', 'timeTravel');
  }

  public clearHistory(): void {
    this.history = [];
  }

  public updateConfig(config: Partial<StateConfig>): void {
    this.config = { ...this.config, ...config };

    if (this.config.autoSave) {
      this.setupAutoSave();
    } else if (this.saveIntervalId) {
      clearInterval(this.saveIntervalId);
    }
  }

  public getConfig(): StateConfig {
    return { ...this.config };
  }

  public destroy(): void {
    if (this.saveIntervalId) {
      clearInterval(this.saveIntervalId);
    }
    UnifiedStateService.instance = null;
  }

  public resetState(): void {
    this.state = {
      bankroll: 0,
      profit: 0,
      riskProfile: RiskProfileType.MODERATE,
      userConstraints: {
        max_bankroll_stake: 0.1,
        time_window_hours: 24,
        preferred_sports: [],
        preferred_markets: [],
      },
      selectedEvent: null,
      recommendations: [],
      bettingOpportunities: [],
      alerts: [],
    };
    this.saveState();
    this.notifySubscribers();
  }
}

export default UnifiedStateService;
