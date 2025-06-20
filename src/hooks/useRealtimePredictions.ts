import { useEffect, useRef, useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { PREDICTIONS_QUERY_KEY } from "./usePredictions";
import { useToast } from "../components/ToastContext";

interface RealtimeMessage {
  type: "welcome" | "ping" | "update" | "data";
  channel?: string;
  data?: any;
  timestamp: number;
}

interface UseRealtimePredictionsOptions {
  enabled?: boolean;
  channels?: string[];
  onError?: (error: Error) => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  lastMessageTimestamp: number | null;
  reconnectAttempts: number;
}

export function useRealtimePredictions({
  enabled = true,
  channels = ["predictions", "market", "sentiment"],
  onError,
  reconnectAttempts: maxReconnectAttempts = 5,
  reconnectInterval = 5000,
}: UseRealtimePredictionsOptions = {}) {
  const [state, setState] = useState<ConnectionState>({
    isConnected: false,
    isConnecting: false,
    lastMessageTimestamp: null,
    reconnectAttempts: 0,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const queryClient = useQueryClient();
  const toast = useToast();

  const updateState = useCallback((updates: Partial<ConnectionState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const wsUrl = import.meta.env.VITE_WEBSOCKET_URL || "ws://localhost:8000";

    // Safety checks to prevent invalid WebSocket connections
    if (
      !wsUrl ||
      wsUrl === "" ||
      wsUrl === "wss://api.betproai.com/ws" ||
      wsUrl.includes("api.betproai.com") ||
      wsUrl.includes("localhost:8000") ||
      import.meta.env.VITE_ENABLE_WEBSOCKET === "false"
    ) {
      console.log(
        "WebSocket connection disabled for realtime predictions:",
        wsUrl,
      );
      updateState({
        isConnecting: false,
        isConnected: false,
        error: "WebSocket connections are currently disabled",
      });
      return;
    }

    updateState({ isConnecting: true });
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      updateState({
        isConnected: true,
        isConnecting: false,
        reconnectAttempts: 0,
      });

      // Subscribe to channels
      ws.send(
        JSON.stringify({
          type: "subscribe",
          channels,
        }),
      );
    };

    ws.onclose = () => {
      updateState({
        isConnected: false,
        isConnecting: false,
      });

      // Attempt to reconnect if we haven't exceeded max attempts
      if (state.reconnectAttempts < maxReconnectAttempts) {
        updateState((prev) => ({
          reconnectAttempts: prev.reconnectAttempts + 1,
        }));

        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, reconnectInterval);
      } else {
        toast("Connection lost. Please refresh the page.", "error");
      }
    };

    ws.onerror = (error) => {
      updateState({
        isConnected: false,
        isConnecting: false,
      });
      onError?.(error as Error);
      toast("Connection error occurred", "error");
    };

    ws.onmessage = (event) => {
      try {
        const message: RealtimeMessage = JSON.parse(event.data);
        updateState({ lastMessageTimestamp: Date.now() });

        switch (message.type) {
          case "ping":
            ws.send(JSON.stringify({ type: "pong" }));
            break;

          case "update":
          case "data":
            if (message.channel === "predictions") {
              // Update predictions cache with timestamp
              queryClient.setQueryData(
                PREDICTIONS_QUERY_KEY,
                (oldData: any) => {
                  if (!oldData) return message.data;
                  return {
                    ...oldData,
                    predictions: {
                      ...oldData.predictions,
                      ...message.data,
                      lastUpdated: message.timestamp,
                    },
                  };
                },
              );
            }
            break;
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
        toast("Failed to process update", "error");
      }
    };

    wsRef.current = ws;
  }, [
    channels,
    onError,
    queryClient,
    toast,
    maxReconnectAttempts,
    reconnectInterval,
    state.reconnectAttempts,
    updateState,
  ]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    updateState({
      isConnected: false,
      isConnecting: false,
      lastMessageTimestamp: null,
      reconnectAttempts: 0,
    });
  }, [updateState]);

  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  const isStale = useCallback(() => {
    if (!state.lastMessageTimestamp) return true;
    const staleThreshold = 30000; // 30 seconds
    return Date.now() - state.lastMessageTimestamp > staleThreshold;
  }, [state.lastMessageTimestamp]);

  return {
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    lastMessageTimestamp: state.lastMessageTimestamp,
    isStale: isStale(),
    reconnectAttempts: state.reconnectAttempts,
    connect,
    disconnect,
  };
}
