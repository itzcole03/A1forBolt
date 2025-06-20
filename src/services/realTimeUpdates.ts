import { Sport } from "./sportsAnalytics.js";
import { notificationService } from "./notification.js";
// import { useWebSocket } from "@/hooks/useWebSocket.js"; // No longer used in service layer

/**
 * Real-time updates feature flag and env config.
 */
const VITE_DISABLE_REALTIME = import.meta.env.VITE_DISABLE_REALTIME === "true";
const VITE_WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3000";

/**
 * Status reporting for UI/monitoring.
 */
declare global {
  interface Window {
    appStatus?: {
      [key: string]: {
        connected: boolean;
        quality: number;
        timestamp: number;
      };
    };
  }
}

function reportRealtimeStatus(
  source: string,
  connected: boolean,
  quality: number,
) {
  if (typeof window !== "undefined" && window.appStatus) {
    window.appStatus["realtime"] = {
      connected,
      quality,
      timestamp: Date.now(),
    };
  }
  // Optionally: emit event or log
  console.info(`[RealTimeUpdatesService] ${source} status:`, {
    connected,
    quality,
  });
}

interface LiveOdds {
  propId: string;
  value: number;
  overMultiplier: number;
  underMultiplier: number;
  timestamp: number;
  movement: {
    direction: "up" | "down" | "stable";
    amount: number;
    timeFrame: number;
  };
}

interface InjuryUpdate {
  playerId: string;
  playerName: string;
  team: string;
  status: "out" | "questionable" | "probable" | "available";
  injury: string;
  timestamp: number;
  expectedReturn?: string;
}

interface LineMovement {
  propId: string;
  oldValue: number;
  newValue: number;
  direction: "up" | "down";
  timestamp: number;
  confidence: number;
}

interface BreakingNews {
  id: string;
  title: string;
  content: string;
  type: "injury" | "trade" | "suspension" | "other";
  timestamp: number;
  impact: "high" | "medium" | "low";
  affectedProps?: string[];
}

interface Prediction {
  id: string;
  event: string;
  market: string;
  prediction: string;
  confidence: number;
  timestamp: number;
}

class RealTimeUpdatesService {
  private static instance: RealTimeUpdatesService;
  private liveOdds: Map<string, LiveOdds> = new Map();
  private injuries: Map<string, InjuryUpdate> = new Map();
  private lineMovements: Map<string, LineMovement[]> = new Map();
  private breakingNews: Map<string, BreakingNews> = new Map();
  private predictions: Map<string, Prediction> = new Map();
  private subscribers: Map<
    keyof RealTimeUpdateEventMap,
    Set<(data: RealTimeUpdateEventMap[keyof RealTimeUpdateEventMap]) => void>
  > = new Map();
  private readonly CACHE_DURATION = 1000 * 60 * 5; // 5 minutes
  private cache: Map<string, unknown> = new Map();
  // WebSocket logic is now handled outside the class for React compliance
  private ws: WebSocket | null = null;
  private connected = false;

  private constructor() {
    if (!VITE_DISABLE_REALTIME) {
      this.initializeWebSocket();
    } else {
      reportRealtimeStatus("disabled", false, 0);
    }
  }

  /**
   * Returns the singleton instance of RealTimeUpdatesService.
   */
  static getInstance(): RealTimeUpdatesService {
    if (!RealTimeUpdatesService.instance) {
      RealTimeUpdatesService.instance = new RealTimeUpdatesService();
    }
    return RealTimeUpdatesService.instance;
  }

  /**
   * Initialize the WebSocket connection for real-time updates.
   * Reports connection status for UI.
   */
  /**
   * Initialize the WebSocket connection for real-time updates.
   * Reports connection status for UI.
   */
  private initializeWebSocket(): void {
    // Safety checks to prevent invalid WebSocket connections
    if (
      !VITE_WS_URL ||
      VITE_WS_URL === "" ||
      VITE_WS_URL === "wss://api.betproai.com/ws" ||
      VITE_WS_URL.includes("api.betproai.com") ||
      VITE_WS_URL.includes("localhost:3000") ||
      VITE_WS_URL.includes("localhost:8000") ||
      VITE_WS_URL.includes("localhost:3001") ||
      import.meta.env.VITE_ENABLE_WEBSOCKET === "false" ||
      VITE_DISABLE_REALTIME
    ) {
      console.log(
        "WebSocket connection disabled for realtime updates service:",
        VITE_WS_URL,
      );
      reportRealtimeStatus("websocket", false, 0);
      return;
    }

    // Use a standard WebSocket for non-React environments
    this.ws = new WebSocket(VITE_WS_URL);
    this.ws.onopen = () => reportRealtimeStatus("websocket", true, 1);
    this.ws.onerror = () => reportRealtimeStatus("websocket", false, 0.5);
    this.ws.onclose = () => reportRealtimeStatus("websocket", false, 0);
    this.ws.onmessage = (event: MessageEvent) => {
      try {
        const data: { type: keyof WebSocketEventMap; payload: unknown } =
          JSON.parse(event.data);
        switch (data.type) {
          case "odds:update":
            if (this.isLiveOdds(data.payload))
              this.updateLiveOdds(data.payload);
            break;
          case "injury:update":
            if (this.isInjuryUpdate(data.payload))
              this.updateInjuryStatus(data.payload);
            break;
          case "line:movement":
            if (this.isLineMovement(data.payload))
              this.recordLineMovement(data.payload);
            break;
          case "news:update":
            if (this.isBreakingNews(data.payload))
              this.addBreakingNews(data.payload);
            break;
          case "prediction:update":
            if (this.isPrediction(data.payload))
              this.updatePrediction(data.payload);
            break;
        }
      } catch (err) {
        console.warn("Failed to parse WebSocket message:", err);
      }
    };
  }

  // Live Odds
  /**
   * Returns the latest live odds for a given propId, using cache if available.
   */
  async getLiveOdds(propId: string): Promise<LiveOdds | null> {
    const cacheKey = `odds_${propId}`;
    const cached = this.getFromCache(cacheKey);
    if (
      cached &&
      typeof cached === "object" &&
      cached !== null &&
      "propId" in cached &&
      "value" in cached &&
      "overMultiplier" in cached &&
      "underMultiplier" in cached
    ) {
      return cached as LiveOdds;
    }

    const odds = this.liveOdds.get(propId);
    if (odds) {
      this.setCache(cacheKey, odds);
    }
    return odds || null;
  }

  /**
   * Updates the live odds and notifies subscribers.
   */
  async updateLiveOdds(odds: LiveOdds): Promise<void> {
    this.liveOdds.set(odds.propId, odds);
    this.notifySubscribers("odds", odds);
    this.setCache(`odds_${odds.propId}`, odds);
  }

  // Injury Updates
  async getInjuryUpdate(playerId: string): Promise<InjuryUpdate | null> {
    return this.injuries.get(playerId) || null;
  }

  async updateInjuryStatus(update: InjuryUpdate): Promise<void> {
    this.injuries.set(update.playerId, update);
    this.notifySubscribers("injury", update);

    if (update.status === "out" || update.status === "questionable") {
      notificationService.notify(
        "warning",
        `${update.playerName} (${update.team}) is ${update.status} - ${update.injury}`,
      );
    }
  }

  // Line Movements
  async getLineMovements(propId: string): Promise<LineMovement[]> {
    return this.lineMovements.get(propId) || [];
  }

  async recordLineMovement(movement: LineMovement): Promise<void> {
    const movements = this.lineMovements.get(movement.propId) || [];
    movements.push(movement);
    this.lineMovements.set(movement.propId, movements);
    this.notifySubscribers("lineMovement", movement);

    if (Math.abs(movement.newValue - movement.oldValue) >= 0.5) {
      notificationService.notify(
        "info",
        `Line moved ${movement.direction} from ${movement.oldValue} to ${movement.newValue}`,
      );
    }
  }

  // Breaking News
  async getBreakingNews(): Promise<BreakingNews[]> {
    return Array.from(this.breakingNews.values()).sort(
      (a, b) => b.timestamp - a.timestamp,
    );
  }

  async addBreakingNews(news: BreakingNews): Promise<void> {
    this.breakingNews.set(news.id, news);
    this.notifySubscribers("breakingNews", news);

    if (news.impact === "high") {
      notificationService.notify("error", news.title);
    }
  }

  // Predictions
  async getPrediction(id: string): Promise<Prediction | null> {
    return this.predictions.get(id) || null;
  }

  async updatePrediction(prediction: Prediction): Promise<void> {
    this.predictions.set(prediction.id, prediction);
    this.notifySubscribers("prediction", prediction);
  }

  // Subscription System
  /**
   * Subscribe to a real-time update event.
   * Returns an unsubscribe function.
   */
  subscribe<K extends keyof RealTimeUpdateEventMap>(
    type: K,
    callback: (data: RealTimeUpdateEventMap[K]) => void,
  ): () => void {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, new Set());
    }
    (
      this.subscribers.get(type) as Set<
        (data: RealTimeUpdateEventMap[K]) => void
      >
    ).add(callback);

    return () => {
      const subscribers = this.subscribers.get(type) as Set<
        (data: RealTimeUpdateEventMap[K]) => void
      >;
      if (subscribers) {
        subscribers.delete(callback);
      }
    };
  }

  /**
   * Notify all subscribers of a given event type.
   */
  private notifySubscribers<K extends keyof RealTimeUpdateEventMap>(
    type: K,
    data: RealTimeUpdateEventMap[K],
  ): void {
    const subscribers = this.subscribers.get(type) as Set<
      (data: RealTimeUpdateEventMap[K]) => void
    >;
    if (subscribers) {
      subscribers.forEach((callback) => callback(data));
    }
  }

  // Sport-specific Updates
  async getSportUpdates(sport: Sport): Promise<{
    odds: LiveOdds[];
    injuries: InjuryUpdate[];
    lineMovements: LineMovement[];
    news: BreakingNews[];
    predictions: Prediction[];
  }> {
    const cacheKey = `sport_updates_${sport}`;
    const cached = this.getFromCache(cacheKey);
    if (
      cached &&
      typeof cached === "object" &&
      cached !== null &&
      "odds" in cached &&
      "injuries" in cached &&
      "lineMovements" in cached &&
      "news" in cached &&
      "predictions" in cached &&
      Array.isArray((cached as { odds: unknown }).odds) &&
      Array.isArray((cached as { injuries: unknown }).injuries) &&
      Array.isArray((cached as { lineMovements: unknown }).lineMovements) &&
      Array.isArray((cached as { news: unknown }).news) &&
      Array.isArray((cached as { predictions: unknown }).predictions)
    ) {
      return cached as {
        odds: LiveOdds[];
        injuries: InjuryUpdate[];
        lineMovements: LineMovement[];
        news: BreakingNews[];
        predictions: Prediction[];
      };
    }

    const updates = {
      odds: Array.from(this.liveOdds.values()).filter((odds) =>
        odds.propId.startsWith(sport),
      ),
      injuries: Array.from(this.injuries.values()).filter((injury) =>
        injury.team.startsWith(sport),
      ),
      lineMovements: Array.from(this.lineMovements.values())
        .flat()
        .filter((movement) => movement.propId.startsWith(sport)),
      news: Array.from(this.breakingNews.values()).filter((news) =>
        news.title.toLowerCase().includes(sport.toLowerCase()),
      ),
      predictions: Array.from(this.predictions.values()).filter(
        (prediction) =>
          typeof prediction.event === "string" &&
          prediction.event.toLowerCase().includes(sport.toLowerCase()),
      ),
    };

    this.setCache(cacheKey, updates);
    return updates;
  }

  // Cache Management
  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key) as
      | { data: T; timestamp: number }
      | undefined;
    if (!cached) return null;
    if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
      this.cache.delete(key);
      return null;
    }
    return cached.data;
  }

  private setCache<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Returns true if the real-time service is connected.
   */
  public isConnected(): boolean {
    return !VITE_DISABLE_REALTIME && this.connected;
  }

  /**
   * Simulate real-time updates if feature flag is disabled or WS fails.
   * Pushes random odds, injuries, etc. for demo/dev mode.
   */
  public simulateRealtime(): void {
    if (!VITE_DISABLE_REALTIME) return;
    // Simulate a random odds update every 10s
    setInterval(() => {
      const odds: LiveOdds = {
        propId: `sim-odds-${Math.floor(Math.random() * 10)}`,
        value: Math.random() * 100,
        overMultiplier: 1.8,
        underMultiplier: 2.0,
        timestamp: Date.now(),
        movement: { direction: "stable", amount: 0, timeFrame: 60 },
      };
      this.updateLiveOdds(odds);
    }, 10000);
    // Simulate a random injury update every 30s
    setInterval(() => {
      const injury: InjuryUpdate = {
        playerId: `sim-player-${Math.floor(Math.random() * 5)}`,
        playerName: "Simulated Player",
        team: "SIM",
        status: "questionable",
        injury: "Simulated Injury",
        timestamp: Date.now(),
      };
      this.updateInjuryStatus(injury);
    }, 30000);
    // Simulate a breaking news every 60s
    setInterval(() => {
      const news: BreakingNews = {
        id: `sim-news-${Date.now()}`,
        title: "Simulated Breaking News",
        content: "This is a simulated news event.",
        type: "other",
        timestamp: Date.now(),
        impact: "medium",
      };
      this.addBreakingNews(news);
    }, 60000);
    reportRealtimeStatus("simulated", false, 0.2);
  }

  // Type guards for event payloads
  private isLiveOdds(data: unknown): data is LiveOdds {
    return (
      typeof data === "object" &&
      data !== null &&
      "propId" in data &&
      "value" in data
    );
  }
  private isInjuryUpdate(data: unknown): data is InjuryUpdate {
    return (
      typeof data === "object" &&
      data !== null &&
      "playerId" in data &&
      "status" in data
    );
  }
  private isLineMovement(data: unknown): data is LineMovement {
    return (
      typeof data === "object" &&
      data !== null &&
      "propId" in data &&
      "oldValue" in data &&
      "newValue" in data
    );
  }
  private isBreakingNews(data: unknown): data is BreakingNews {
    return (
      typeof data === "object" &&
      data !== null &&
      "id" in data &&
      "title" in data
    );
  }
  private isPrediction(data: unknown): data is Prediction {
    return (
      typeof data === "object" &&
      data !== null &&
      "id" in data &&
      "prediction" in data
    );
  }
}

/**
 * Event map for strict typing of real-time event subscriptions.
 */
interface RealTimeUpdateEventMap {
  odds: LiveOdds;
  injury: InjuryUpdate;
  lineMovement: LineMovement;
  breakingNews: BreakingNews;
  prediction: Prediction;
}

interface WebSocketEventMap {
  "odds:update": LiveOdds;
  "injury:update": InjuryUpdate;
  "line:movement": LineMovement;
  "news:update": BreakingNews;
  "prediction:update": Prediction;
}

// TODO: Add comprehensive unit and integration tests for all fallback and error-handling logic.
export const realTimeUpdates = RealTimeUpdatesService.getInstance();
if (VITE_DISABLE_REALTIME) {
  realTimeUpdates.simulateRealtime();
}
