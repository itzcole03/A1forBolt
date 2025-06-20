import { BaseService } from "./BaseService.js";
import { UnifiedServiceRegistry } from "./UnifiedServiceRegistry.js";

import { WebSocketMessage } from "../../types/webSocket.js";
import { toast } from "react-toastify";

export interface WebSocketConfig {
  reconnectAttempts: number;
  reconnectInterval: number;
  pingInterval: number;
  pongTimeout: number;
  messageQueueSize: number;
  autoReconnect: boolean;
  debug: boolean;
}

export class UnifiedWebSocketService extends BaseService {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private messageQueue: WebSocketMessage[] = [];
  private isProcessingQueue = false;
  private subscriptions: Map<
    string,
    Set<(data: WebSocketMessage["data"]) => void>
  > = new Map();
  private pingInterval: NodeJS.Timeout | null = null;
  private pongTimeout: NodeJS.Timeout | null = null;
  private lastPongTime: number = 0;
  private wsConfig: WebSocketConfig;

  constructor(
    private url: string,
    wsConfig: WebSocketConfig = {
      reconnectAttempts: 5,
      reconnectInterval: 1000,
      pingInterval: 30000,
      pongTimeout: 5000,
      messageQueueSize: 100,
      autoReconnect: true,
      debug: false,
    },
    serviceRegistry: UnifiedServiceRegistry,
  ) {
    super("UnifiedWebSocketService", serviceRegistry);
    this.wsConfig = wsConfig;
  }

  async connect(): Promise<void> {
    try {
      // Skip connection if no valid WebSocket URL is configured
      if (
        !this.url ||
        this.url.includes("api.betproai.com") ||
        this.url === "wss://api.betproai.com/ws"
      ) {
        this.logger.warn(
          "WebSocket connection skipped: No valid WebSocket URL configured. Set VITE_WS_URL environment variable to enable WebSocket functionality.",
          this.name,
        );
        return;
      }

      this.socket = new WebSocket(this.url);
      this.setupEventHandlers();
      this.startPingInterval();
      this.logger.info("WebSocket connected", this.name);
    } catch (error) {
      this.handleError(error, {
        code: "WEBSOCKET_CONNECT_ERROR",
        source: this.name,
        details: { url: this.url },
      });
      throw error;
    }
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    this.stopPingInterval();
    this.clearPongTimeout();
    this.logger.info("WebSocket disconnected", this.name);
  }

  subscribe(
    channel: string,
    callback: (data: WebSocketMessage["data"]) => void,
  ): () => void {
    if (!this.subscriptions.has(channel)) {
      this.subscriptions.set(channel, new Set());
    }
    this.subscriptions.get(channel)!.add(callback);

    // Send subscription message to server
    this.send({
      event: "subscribe",
      data: { channel },
      timestamp: Date.now(),
    });

    return () => {
      const callbacks = this.subscriptions.get(channel);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.subscriptions.delete(channel);
          // Send unsubscribe message to server
          this.send({
            event: "unsubscribe",
            data: { channel },
            timestamp: Date.now(),
          });
        }
      }
    };
  }

  send(message: WebSocketMessage): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.queueMessage(message);
      return;
    }

    try {
      this.socket.send(JSON.stringify(message));
    } catch (error) {
      this.handleError(error, {
        code: "WEBSOCKET_SEND_ERROR",
        source: this.name,
        details: { message },
      });
      this.queueMessage(message);
    }
  }

  private setupEventHandlers(): void {
    if (!this.socket) return;

    this.socket.onopen = () => {
      this.reconnectAttempts = 0;
      this.processMessageQueue();
      this.logger.info("WebSocket connection established", this.name);
    };

    this.socket.onclose = () => {
      this.handleDisconnect();
    };

    this.socket.onerror = (error) => {
      this.handleError(error, {
        code: "WEBSOCKET_ERROR",
        source: this.name,
        details: { event: "error" },
      });
    };

    this.socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleMessage(message);
      } catch (error) {
        this.handleError(error, {
          code: "WEBSOCKET_MESSAGE_ERROR",
          source: this.name,
          details: { data: event.data },
        });
      }
    };
  }

  private handleMessage(message: WebSocketMessage): void {
    // Handle ping/pong
    if (message.event === "ping") {
      this.send({ event: "pong", data: null, timestamp: Date.now() });
      return;
    }

    if (message.event === "pong") {
      this.lastPongTime = Date.now();
      this.clearPongTimeout();
      return;
    }

    // Handle channel messages
    if (message.event && this.subscriptions.has(message.event)) {
      const callbacks = this.subscriptions.get(message.event)!;
      callbacks.forEach((callback) => {
        try {
          callback(message.data);
        } catch (error) {
          this.handleError(error, {
            code: "WEBSOCKET_CALLBACK_ERROR",
            source: this.name,
            details: { event: message.event },
          });
        }
      });
    }

    // Handle system messages
    if (message.event === "error") {
      this.handleError(message.data, {
        code: "WEBSOCKET_SYSTEM_ERROR",
        source: this.name,
        details: message.data,
      });
      toast.error(message.data.message || "WebSocket error occurred");
    }
  }

  private handleDisconnect(): void {
    this.stopPingInterval();
    this.clearPongTimeout();

    if (
      this.wsConfig.autoReconnect &&
      this.reconnectAttempts < this.wsConfig.reconnectAttempts
    ) {
      this.reconnectAttempts++;
      const delay = Math.min(
        this.wsConfig.reconnectInterval *
          Math.pow(2, this.reconnectAttempts - 1),
        30000,
      );
      setTimeout(() => this.connect(), delay);
      this.logger.warn(
        `Attempting to reconnect (${this.reconnectAttempts}/${this.wsConfig.reconnectAttempts})`,
        this.name,
      );
    } else {
      this.logger.error("WebSocket connection failed", this.name);
      toast.error("Lost connection to server. Please refresh the page.");
    }
  }

  private queueMessage(message: WebSocketMessage): void {
    if (this.messageQueue.length >= this.wsConfig.messageQueueSize) {
      this.messageQueue.shift(); // Remove oldest message if queue is full
    }
    this.messageQueue.push(message);
  }

  private async processMessageQueue(): Promise<void> {
    if (
      this.isProcessingQueue ||
      !this.socket ||
      this.socket.readyState !== WebSocket.OPEN
    ) {
      return;
    }

    this.isProcessingQueue = true;
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift()!;
      try {
        this.socket.send(JSON.stringify(message));
      } catch (error) {
        this.handleError(error, {
          code: "WEBSOCKET_QUEUE_ERROR",
          source: this.name,
          details: { message },
        });
        this.messageQueue.unshift(message); // Put message back at start of queue
        break;
      }
    }
    this.isProcessingQueue = false;
  }

  private startPingInterval(): void {
    this.stopPingInterval();
    this.pingInterval = setInterval(() => {
      this.send({ event: "ping", data: null, timestamp: Date.now() });
      this.setPongTimeout();
    }, this.wsConfig.pingInterval);
  }

  private stopPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  private setPongTimeout(): void {
    this.clearPongTimeout();
    this.pongTimeout = setTimeout(() => {
      this.logger.warn("Pong timeout - reconnecting", this.name);
      this.disconnect();
      this.connect();
    }, this.wsConfig.pongTimeout);
  }

  private clearPongTimeout(): void {
    if (this.pongTimeout) {
      clearTimeout(this.pongTimeout);
      this.pongTimeout = null;
    }
  }
}
