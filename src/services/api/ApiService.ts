/**
 * Generic GET method for arbitrary endpoints.
 * @param url - The endpoint URL (absolute or relative).
 * @param params - Query parameters as a key-value object.
 * @returns Parsed response data of type T.
 */
import { Subject } from "rxjs";

interface ApiConfig {
  endpoints: {
    sportradar: string;
    oddsapi: string;
    espn: string;
    social: string;
  };
  apiKeys: {
    sportradar?: string;
    oddsapi?: string;
    espn?: string;
    social?: string;
  };
  websocket: {
    url: string;
    reconnectInterval: number;
    maxRetries: number;
  };
  /**
   * Generic GET method for arbitrary endpoints.
   * @param url - The endpoint URL (absolute or relative).
   * @param params - Query parameters as a key-value object.
   * @returns Parsed response data of type T.
   */
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: number;
}

interface PlayerStats {
  player: string;
  team: string;
  position: string;
  stats: Record<string, number>;
  lastUpdated: string;
}

interface GameOdds {
  game: string;
  timestamp: string;
  bookmaker: string;
  market: string;
  outcomes: {
    name: string;
    price: number;
    point?: number;
  }[];
}

interface InjuryReport {
  player: string;
  team: string;
  status: string;
  injury: string;
  expectedReturn?: string;
}

interface NewsUpdate {
  source: string;
  title: string;
  content: string;
  timestamp: string;
  relevance: number;
  sentiment?: number;
}

export class ApiService {
  private config: ApiConfig;
  private ws: WebSocket | null = null;
  private retryCount = 0;
  private dataStream = new Subject<any>();

  constructor(config: ApiConfig) {
    this.config = config;
    this.initializeWebSocket();
  }

  private initializeWebSocket() {
    if (this.ws) {
      this.ws.close();
    }

    // Safety checks to prevent invalid WebSocket connections
    if (
      !this.config.websocket.url ||
      this.config.websocket.url === "" ||
      this.config.websocket.url === "wss://api.betproai.com/ws" ||
      this.config.websocket.url.includes("api.betproai.com") ||
      this.config.websocket.url.includes("localhost:8000") ||
      this.config.websocket.url.includes("localhost:8080") ||
      this.config.websocket.url.includes("localhost:3001") ||
      this.config.websocket.url.includes("localhost") ||
      import.meta.env.VITE_ENABLE_WEBSOCKET === "false" ||
      import.meta.env.NODE_ENV === "development"
    ) {
      console.log(
        "WebSocket connection disabled for ApiService (comprehensive safety):",
        this.config.websocket.url,
      );
      return;
    }

    this.ws = new WebSocket(this.config.websocket.url);

    this.ws.onopen = () => {
      console.log("WebSocket connection established");
      this.retryCount = 0;
      this.subscribeToDataFeeds();
    };

    this.ws.onmessage = (event: MessageEvent) => {
      const data = event.data;
      try {
        const parsedData = JSON.parse(data.toString());
        this.dataStream.next(parsedData);
      } catch (error) {
        console.error("Error parsing WebSocket message:", error);
      }
    };

    this.ws.onclose = () => {
      console.log("WebSocket connection closed");
      this.handleReconnection();
    };

    this.ws.onerror = (event: Event) => {
      console.error("WebSocket error:", event);
      this.handleReconnection();
    };
  }

  private handleReconnection() {
    if (this.retryCount < this.config.websocket.maxRetries) {
      this.retryCount++;
      console.log(
        `Attempting to reconnect (${this.retryCount}/${this.config.websocket.maxRetries})`,
      );
      setTimeout(() => {
        this.initializeWebSocket();
      }, this.config.websocket.reconnectInterval);
    } else {
      console.error("Max WebSocket reconnection attempts reached");
    }
  }

  private subscribeToDataFeeds() {
    if (!this.ws) return;

    // Subscribe to relevant data feeds
    const subscriptions = [
      { type: "odds_updates", markets: ["player_props"] },
      { type: "player_stats", updateInterval: 60 },
      { type: "injury_updates" },
      { type: "news_feed" },
    ];

    this.ws.send(
      JSON.stringify({
        action: "subscribe",
        feeds: subscriptions,
      }),
    );
  }

  public getDataStream() {
    return this.dataStream.asObservable();
  }

  public async fetchPlayerStats(
    playerId: string,
    options: { days?: number; type?: string[] } = {},
  ): Promise<ApiResponse<PlayerStats[]>> {
    try {
      const response = await fetch(
        `${this.config.endpoints.sportradar}/players/${playerId}/stats`,
        {
          headers: this.getHeaders("sportradar"),
          method: "GET",
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Error fetching player stats:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: Date.now(),
      };
    }
  }

  public async fetchGameOdds(
    gameId: string,
    options: { markets?: string[]; books?: string[] } = {},
  ): Promise<ApiResponse<GameOdds[]>> {
    try {
      const queryParams = new URLSearchParams({
        markets: options.markets?.join(",") || "all",
        books: options.books?.join(",") || "all",
      });

      const response = await fetch(
        `${this.config.endpoints.oddsapi}/games/${gameId}/odds?${queryParams}`,
        {
          headers: this.getHeaders("oddsapi"),
          method: "GET",
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Error fetching game odds:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: Date.now(),
      };
    }
  }

  public async fetchInjuryReports(
    options: { team?: string; status?: string[] } = {},
  ): Promise<ApiResponse<InjuryReport[]>> {
    try {
      const queryParams = new URLSearchParams({
        team: options.team || "",
        status: options.status?.join(",") || "",
      });

      const response = await fetch(
        `${this.config.endpoints.espn}/injuries?${queryParams}`,
        {
          headers: this.getHeaders("espn"),
          method: "GET",
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Error fetching injury reports:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: Date.now(),
      };
    }
  }

  async getSocialNews(
    params: Record<string, any> = {},
  ): Promise<ApiResponse<any>> {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const response = await fetch(
        `${this.config.endpoints.social}/news?${queryParams}`,
        {
          headers: this.getHeaders("social"),
          method: "GET",
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Error fetching news:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: Date.now(),
      };
    }
  }

  private getHeaders(
    service: keyof ApiConfig["apiKeys"],
  ): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const apiKey = this.config.apiKeys[service];
    if (apiKey) {
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    return headers;
  }

  public async fetchHistoricalData(options: {
    startDate: string;
    endDate: string;
    players?: string[];
    teams?: string[];
    propTypes?: string[];
  }): Promise<ApiResponse<any[]>> {
    try {
      const queryParams = new URLSearchParams({
        startDate: options.startDate,
        endDate: options.endDate,
        players: options.players?.join(",") || "",
        teams: options.teams?.join(",") || "",
        propTypes: options.propTypes?.join(",") || "",
      });

      const response = await fetch(
        `${this.config.endpoints.sportradar}/historical?${queryParams}`,
        {
          headers: this.getHeaders("sportradar"),
          method: "GET",
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error("Error fetching historical data:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: Date.now(),
      };
    }
  }
  /**
   * Generic GET method for arbitrary endpoints.
   * @param url - The endpoint URL (absolute or relative).
   * @param params - Query parameters as a key-value object.
   * @returns Parsed response data of type T.
   */
  public async get<T>(url: string, params?: Record<string, any>): Promise<T> {
    const query = params ? `?${new URLSearchParams(params).toString()}` : "";
    const fullUrl = url + query;
    const response = await fetch(fullUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }
}

// Create and export the service instance
export const apiService = new ApiService({
  endpoints: {
    // Vite: use import.meta.env.VITE_SPORTRADAR_API_ENDPOINT etc.
    sportradar: import.meta.env.VITE_SPORTRADAR_API_ENDPOINT || "",
    oddsapi: import.meta.env.VITE_ODDS_API_ENDPOINT || "",
    espn: import.meta.env.VITE_ESPN_API_ENDPOINT || "",
    social: import.meta.env.VITE_SOCIAL_API_ENDPOINT || "",
  },
  apiKeys: {
    sportradar: import.meta.env.VITE_SPORTRADAR_API_KEY,
    oddsapi: import.meta.env.VITE_ODDS_API_KEY,
    espn: import.meta.env.VITE_ESPN_API_KEY,
    social: import.meta.env.VITE_SOCIAL_API_KEY,
  },
  websocket: {
    url: import.meta.env.VITE_WEBSOCKET_URL || "ws://localhost:8080",
    reconnectInterval: 5000,
    maxRetries: 5,
  },
});
