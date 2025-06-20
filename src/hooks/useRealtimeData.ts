import { useState, useEffect, useCallback, useRef } from "react";

interface WebSocketMessage<T = unknown> {
  type: string;
  data: T;
  timestamp: number;
}

interface UseRealtimeDataOptions<T> {
  url: string;
  initialData?: T | null;
  onMessage?: (message: WebSocketMessage<T>) => void;
  onError?: (error: Error) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  heartbeatInterval?: number;
  subscriptions?: string[];
}

interface UseRealtimeDataResult<T> {
  data: T | null;
  isConnected: boolean;
  error: Error | null;
  send: (message: any) => void;
  subscribe: (channel: string) => void;
  unsubscribe: (channel: string) => void;
  reconnect: () => void;
}

export function useRealtimeData<T>({
  url,
  initialData = null,
  onMessage,
  onError,
  onConnected,
  onDisconnected,
  reconnectAttempts = 5,
  reconnectDelay = 1000,
  heartbeatInterval = 30000,
  subscriptions = [],
}: UseRealtimeDataOptions<T>): UseRealtimeDataResult<T> {
  const [data, setData] = useState<T | null>(initialData);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [activeSubscriptions, setActiveSubscriptions] = useState<Set<string>>(
    new Set(subscriptions),
  );

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef(0);
  const heartbeatTimeoutRef = useRef<number>();

  const connect = useCallback(() => {
    // Safety checks to prevent invalid WebSocket connections
    if (
      !url ||
      url === "" ||
      url === "wss://api.betproai.com/ws" ||
      url.includes("api.betproai.com") ||
      url.includes("localhost:8000") ||
      url.includes("localhost:3001") ||
      import.meta.env.VITE_ENABLE_WEBSOCKET === "false"
    ) {
      console.log("WebSocket connection disabled for realtime data:", url);
      setError("WebSocket connections are currently disabled");
      return;
    }

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        reconnectCountRef.current = 0;
        onConnected?.();

        // Subscribe to all active channels
        activeSubscriptions.forEach((channel) => {
          ws.send(JSON.stringify({ type: "subscribe", channel }));
        });

        // Start heartbeat
        if (heartbeatInterval > 0) {
          heartbeatTimeoutRef.current = window.setInterval(() => {
            ws.send(JSON.stringify({ type: "ping" }));
          }, heartbeatInterval);
        }
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage<T> = JSON.parse(event.data);

          if (message.type === "pong") {
            return; // Ignore heartbeat responses
          }

          setData(message.data);
          onMessage?.(message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      ws.onerror = (event) => {
        const wsError = new Error("WebSocket error");
        setError(wsError);
        onError?.(wsError);
      };

      ws.onclose = () => {
        setIsConnected(false);
        onDisconnected?.();

        // Clear heartbeat interval
        if (heartbeatTimeoutRef.current) {
          clearInterval(heartbeatTimeoutRef.current);
        }

        // Attempt to reconnect
        if (reconnectCountRef.current < reconnectAttempts) {
          reconnectCountRef.current++;
          setTimeout(connect, reconnectDelay * reconnectCountRef.current);
        }
      };
    } catch (error) {
      if (error instanceof Error) {
        setError(error);
        onError?.(error);
      }
    }
  }, [
    url,
    onMessage,
    onError,
    onConnected,
    onDisconnected,
    reconnectAttempts,
    reconnectDelay,
    heartbeatInterval,
    activeSubscriptions,
  ]);

  const send = useCallback((message: any) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      throw new Error("WebSocket is not connected");
    }

    wsRef.current.send(JSON.stringify(message));
  }, []);

  const subscribe = useCallback(
    (channel: string) => {
      setActiveSubscriptions((prev) => {
        const next = new Set(prev);
        next.add(channel);
        return next;
      });

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        send({ type: "subscribe", channel });
      }
    },
    [send],
  );

  const unsubscribe = useCallback(
    (channel: string) => {
      setActiveSubscriptions((prev) => {
        const next = new Set(prev);
        next.delete(channel);
        return next;
      });

      if (wsRef.current?.readyState === WebSocket.OPEN) {
        send({ type: "unsubscribe", channel });
      }
    },
    [send],
  );

  const reconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
    }
    reconnectCountRef.current = 0;
    connect();
  }, [connect]);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (heartbeatTimeoutRef.current) {
        clearInterval(heartbeatTimeoutRef.current);
      }
    };
  }, [connect]);

  return {
    data,
    isConnected,
    error,
    send,
    subscribe,
    unsubscribe,
    reconnect,
  };
}

// Example usage:
/*
interface OddsUpdate {
  gameId: string;
  odds: number;
  timestamp: number;
}

function LiveOddsTracker() {
  const {
    data,
    isConnected,
    error,
    subscribe,
    unsubscribe
  } = useRealtimeData<OddsUpdate>({
    url: 'wss://api.betproai.com/odds',
    onMessage: (message) => {

    },
    onError: (error) => {
      console.error('WebSocket error:', error);
    },
    subscriptions: ['NFL', 'NBA']
  });

  useEffect(() => {
    // Subscribe to additional channels
    subscribe('MLB');

    return () => {
      // Cleanup subscriptions
      unsubscribe('MLB');
    };
  }, [subscribe, unsubscribe]);

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <div>Connection status: {isConnected ? 'Connected' : 'Disconnected'}</div>
      {data && (
        <div>
          Latest odds: {data.odds} (Game: {data.gameId})
        </div>
      )}
    </div>
  );
}
*/
