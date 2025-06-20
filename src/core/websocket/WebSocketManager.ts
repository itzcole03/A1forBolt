import { WebSocket } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from 'events';
import { UnifiedLogger } from '../logging/types';
import { UnifiedError } from '../error/types';

interface WebSocketMessage {
  type: string;
  data: any;
  timestamp: number;
}

interface WebSocketClient {
  id: string;
  socket: WebSocket;
  subscriptions: Set<string>;
  lastPing: number;
  reconnectAttempts: number;
  messageQueue: WebSocketMessage[];
}

interface WebSocketEvents {
  message: [clientId: string, message: any, topic?: string];
  disconnect: [clientId: string];
}

export class WebSocketManager extends EventEmitter {
  private clients: Map<string, WebSocketClient> = new Map();
  private readonly MAX_RECONNECT_ATTEMPTS = 5;
  private readonly RECONNECT_DELAY = 1000;
  private readonly PING_INTERVAL = 30000;
  private readonly MESSAGE_QUEUE_LIMIT = 100;
  private pingInterval: NodeJS.Timeout | null = null;

  constructor(private logger: UnifiedLogger) {
    super();
    this.startPingInterval();
  }

  override on<K extends keyof WebSocketEvents>(
    event: K,
    listener: (...args: WebSocketEvents[K]) => void
  ): this {
    return super.on(event, listener);
  }

  override emit<K extends keyof WebSocketEvents>(event: K, ...args: WebSocketEvents[K]): boolean {
    return super.emit(event, ...args);
  }

  private startPingInterval(): void {
    this.pingInterval = setInterval(() => {
      this.clients.forEach((client, id) => {
        if (Date.now() - client.lastPing > this.PING_INTERVAL * 2) {
          this.handleClientDisconnect(id);
        } else {
          this.sendPing(id);
        }
      });
    }, this.PING_INTERVAL);
  }

  async connect(socket: WebSocket): Promise<string> {
    const clientId = uuidv4();
    const client: WebSocketClient = {
      id: clientId,
      socket,
      subscriptions: new Set(),
      lastPing: Date.now(),
      reconnectAttempts: 0,
      messageQueue: [],
    };

    this.clients.set(clientId, client);
    this.setupSocketHandlers(client);

    this.logger.info(`Client connected: ${clientId}`);
    return clientId;
  }

  private setupSocketHandlers(client: WebSocketClient): void {
    client.socket.on('message', (data: string) => {
      try {
        const message = JSON.parse(data);
        this.handleMessage(client, message);
      } catch (error) {
        this.logger.error(`Error parsing message from client ${client.id}: ${error}`);
        this.sendError(client.id, 'Invalid message format');
      }
    });

    client.socket.on('close', () => {
      this.handleClientDisconnect(client.id);
    });

    client.socket.on('error', error => {
      this.logger.error(`WebSocket error for client ${client.id}: ${error}`);
      this.handleClientDisconnect(client.id);
    });
  }

  private handleMessage(client: WebSocketClient, message: any): void {
    if (!message.type) {
      this.sendError(client.id, 'Message type is required');
      return;
    }

    switch (message.type) {
      case 'subscribe':
        this.handleSubscribe(client, message.data);
        break;
      case 'unsubscribe':
        this.handleUnsubscribe(client, message.data);
        break;
      case 'ping':
        this.handlePing(client);
        break;
      default:
        this.emit('message', client.id, message, Array.from(client.subscriptions)[0]);
    }
  }

  private handleSubscribe(client: WebSocketClient, topics: string[]): void {
    topics.forEach(topic => {
      client.subscriptions.add(topic);
      this.logger.info(`Client ${client.id} subscribed to ${topic}`);
    });
  }

  private handleUnsubscribe(client: WebSocketClient, topics: string[]): void {
    topics.forEach(topic => {
      client.subscriptions.delete(topic);
      this.logger.info(`Client ${client.id} unsubscribed from ${topic}`);
    });
  }

  private handlePing(client: WebSocketClient): void {
    client.lastPing = Date.now();
    this.sendMessage(client.id, { type: 'pong', data: null, timestamp: Date.now() });
  }

  private handleClientDisconnect(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    if (client.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
      client.reconnectAttempts++;
      setTimeout(() => {
        this.attemptReconnect(client);
      }, this.RECONNECT_DELAY * client.reconnectAttempts);
    } else {
      this.removeClient(clientId);
    }
  }

  private async attemptReconnect(client: WebSocketClient): Promise<void> {
    try {
      // Implement reconnection logic here
      this.logger.info(`Attempting to reconnect client ${client.id}`);
      // For now, just remove the client
      this.removeClient(client.id);
    } catch (error) {
      this.logger.error(`Reconnection failed for client ${client.id}: ${error}`);
      this.removeClient(client.id);
    }
  }

  private removeClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.socket.close();
    this.clients.delete(clientId);
    this.logger.info(`Client disconnected: ${clientId}`);
    this.emit('disconnect', clientId);
  }

  sendMessage(clientId: string, message: WebSocketMessage): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    if (client.socket.readyState === WebSocket.OPEN) {
      client.socket.send(JSON.stringify(message));
    } else {
      this.queueMessage(client, message);
    }
  }

  private queueMessage(client: WebSocketClient, message: WebSocketMessage): void {
    if (client.messageQueue.length >= this.MESSAGE_QUEUE_LIMIT) {
      client.messageQueue.shift(); // Remove oldest message
    }
    client.messageQueue.push(message);
  }

  private sendPing(clientId: string): void {
    this.sendMessage(clientId, { type: 'ping', data: null, timestamp: Date.now() });
  }

  private sendError(clientId: string, error: string): void {
    this.sendMessage(clientId, {
      type: 'error',
      data: { message: error },
      timestamp: Date.now(),
    });
  }

  broadcast(message: WebSocketMessage, topic?: string): void {
    this.clients.forEach((client, clientId) => {
      if (!topic || client.subscriptions.has(topic)) {
        this.sendMessage(clientId, message);
      }
    });
  }

  getClientCount(): number {
    return this.clients.size;
  }

  getSubscriberCount(topic: string): number {
    let count = 0;
    this.clients.forEach(client => {
      if (client.subscriptions.has(topic)) count++;
    });
    return count;
  }

  cleanup(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }
    this.clients.forEach((client, id) => {
      this.removeClient(id);
    });
  }
}
