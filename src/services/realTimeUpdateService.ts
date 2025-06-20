import { SportsDataApi, OddsDataApi, SentimentApi } from "./integrations";
import { EventEmitter } from "events";
import { isFeatureEnabled } from "./configService.ts";
import {
  normalizePlayerProp,
  normalizeGameState,
  normalizeSentiment,
} from "./integrations/normalizeExternalData.js";
import { logLiveData } from "./integrations/liveDataLogger.js";

// Status reporting for UI/monitoring
function reportRealTimeStatus(connected: boolean, quality: number) {
  if (typeof window !== "undefined") {
    if (!window.appStatus) window.appStatus = {};
    window.appStatus.realtime = { connected, quality, timestamp: Date.now() };
  }
}

// Simulated fallback data for degraded/disabled scenarios
const simulatedGames = [
  {
    id: "sim-game",
    status: "scheduled",
    teams: ["A", "B"],
    startTime: new Date().toISOString(),
  },
];
const simulatedOdds = [{ id: "sim-odds", player: "Sim Player", value: 1.5 }];
const simulatedSentiment = [
  { id: "sim-sentiment", player: "Sim Player", sentiment: 0 },
];

export class RealTimeUpdateService extends EventEmitter {
  private sportsApi = new SportsDataApi();
  private oddsApi = new OddsDataApi();
  private sentimentApi = new SentimentApi();
  private pollingInterval = 10000; // fallback polling in ms
  private pollingTimer: NodeJS.Timeout | null = null;
  private ws: WebSocket | null = null;
  private featureEnabled = true;

  constructor() {
    super();
    this.initialize();
  }

  private async initialize() {
    this.featureEnabled = await isFeatureEnabled("REALTIME_UPDATES");
    if (!this.featureEnabled) {
      reportRealTimeStatus(false, 0);
      logLiveData(
        "[RealTimeUpdateService] Feature flag disabled. No real-time updates.",
      );
      this.emit("games", simulatedGames);
      this.emit("odds", simulatedOdds);
      this.emit("sentiment", simulatedSentiment);
      return;
    }
    this.initWebSocket();
  }

  private initWebSocket() {
    if (!this.featureEnabled) return;

    const wsUrl = process.env.VITE_REALTIME_WS_URL || "";

    // Safety checks to prevent invalid WebSocket connections - AGGRESSIVE FOR DEBUGGING
    if (
      !wsUrl ||
      wsUrl === "" ||
      wsUrl === "wss://api.betproai.com/ws" ||
      wsUrl.includes("api.betproai.com") ||
      wsUrl.includes("localhost") ||
      wsUrl.includes("ws://") ||
      wsUrl.includes("wss://") ||
      import.meta.env.VITE_ENABLE_WEBSOCKET === "false" ||
      import.meta.env.NODE_ENV === "development"
    ) {
      console.log(
        "WebSocket connection disabled for realtime updates (aggressive safety):",
        wsUrl,
      );
      this.startPollingFallback();
      return;
    }

    try {
      this.ws = new WebSocket(wsUrl);
      this.ws.onmessage = (event) => this.handleMessage(event.data);
      this.ws.onerror = () => this.startPollingFallback();
      this.ws.onclose = () => this.startPollingFallback();
      reportRealTimeStatus(true, 1);
    } catch {
      this.startPollingFallback();
    }
  }

  private handleMessage(data: string) {
    try {
      const parsed = JSON.parse(data);
      // Normalize and route to appropriate listeners
      let normalized;
      switch (parsed.type) {
        case "games":
          normalized = Array.isArray(parsed.payload)
            ? parsed.payload.map(normalizeGameState)
            : normalizeGameState(parsed.payload);
          break;
        case "odds":
          normalized = Array.isArray(parsed.payload)
            ? parsed.payload.map(normalizePlayerProp)
            : normalizePlayerProp(parsed.payload);
          break;
        case "sentiment":
          normalized = Array.isArray(parsed.payload)
            ? parsed.payload.map(normalizeSentiment)
            : normalizeSentiment(parsed.payload);
          break;
        default:
          normalized = parsed.payload;
      }
      this.emit(parsed.type, normalized);
      logLiveData(`[WS] ${parsed.type} update received`);
    } catch (e) {
      // Log parse error
      logLiveData(`[WS ERROR] Failed to parse message: ${e}`);
      console.error("[RealTimeUpdateService] Failed to parse WS message:", e);
    }
  }

  private startPollingFallback() {
    if (!this.featureEnabled) return;
    if (this.pollingTimer) return;
    reportRealTimeStatus(false, 0.5);
    logLiveData("[FALLBACK] WebSocket failed, using polling fallback");
    this.pollingTimer = setInterval(() => this.pollAll(), this.pollingInterval);
  }

  private async pollAll() {
    if (!this.featureEnabled) {
      reportRealTimeStatus(false, 0);
      this.emit("games", simulatedGames);
      this.emit("odds", simulatedOdds);
      this.emit("sentiment", simulatedSentiment);
      return;
    }
    // Poll all APIs for updates
    try {
      const [games, odds, sentiment] = await Promise.all([
        this.sportsApi.getGames(),
        this.oddsApi.getOdds(),
        this.sentimentApi.getSentimentSnapshot(),
      ]);
      this.emit(
        "games",
        Array.isArray(games)
          ? games.map(normalizeGameState)
          : normalizeGameState(games),
      );
      this.emit(
        "odds",
        Array.isArray(odds)
          ? odds.map(normalizePlayerProp)
          : normalizePlayerProp(odds),
      );
      this.emit(
        "sentiment",
        Array.isArray(sentiment)
          ? sentiment.map(normalizeSentiment)
          : normalizeSentiment(sentiment),
      );
      reportRealTimeStatus(true, 1);
      logLiveData("[POLL] Data polled from APIs");
    } catch (e) {
      reportRealTimeStatus(false, 0.3);
      logLiveData(`[POLL ERROR] ${e}`);
      console.error("[RealTimeUpdateService] Polling error:", e);
      this.emit("games", simulatedGames);
      this.emit("odds", simulatedOdds);
      this.emit("sentiment", simulatedSentiment);
    }
  }

  public stop() {
    if (this.pollingTimer) clearInterval(this.pollingTimer);
    if (this.ws) this.ws.close();
  }
}

export const realTimeUpdateService = new RealTimeUpdateService();
