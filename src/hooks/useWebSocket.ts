import useStore from "../store/useStore";
import { WSMessage } from "../types";
import { useEffect, useCallback, useRef } from "react";

interface UseWebSocketOptions {
  url: string;
  onMessage?: (message: WSMessage) => void;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  autoReconnect?: boolean;
}

export const useWebSocket = ({
  url,
  onMessage,
  reconnectAttempts = 5,
  reconnectDelay = 1000,
  autoReconnect = true,
}: UseWebSocketOptions) => {
  const ws = useRef<WebSocket | null>(null);
  const reconnectCount = useRef(0);
  const { addToast } = useStore();

  const connect = useCallback(() => {
    // Safety checks to prevent invalid WebSocket connections
    // Disable ALL WebSocket connections for debugging
    if (
      !url ||
      url === "" ||
      url === "wss://api.betproai.com/ws" ||
      url.includes("api.betproai.com") ||
      url.includes("localhost") ||
      url.includes("ws://") ||
      url.includes("wss://") ||
      import.meta.env.VITE_ENABLE_WEBSOCKET === "false" ||
      import.meta.env.NODE_ENV === "development"
    ) {
      console.log("WebSocket connection disabled or invalid URL:", url);
      return;
    }

    try {
      console.log("Attempting WebSocket connection to:", url);
      ws.current = new WebSocket(url);

      ws.current.onopen = () => {
        console.log("WebSocket connected to:", url);
        reconnectCount.current = 0;
      };

      ws.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data) as WSMessage;
          onMessage?.(message);
        } catch (error) {
          console.error("Failed to parse WebSocket message:", error);
        }
      };

      ws.current.onclose = () => {
        if (autoReconnect && reconnectCount.current < reconnectAttempts) {
          const delay = reconnectDelay * Math.pow(2, reconnectCount.current);

          setTimeout(() => {
            reconnectCount.current++;
            connect();
          }, delay);
        } else if (reconnectCount.current >= reconnectAttempts) {
          addToast({
            id: "ws-error",
            type: "error",
            title: "Connection Error",
            message:
              "Failed to establish WebSocket connection. Please try again later.",
          });
        }
      };

      ws.current.onerror = (error) => {
        console.error("WebSocket error:", error);
      };
    } catch (error) {
      console.error("Failed to create WebSocket connection:", error);
    }
  }, [
    url,
    onMessage,
    reconnectAttempts,
    reconnectDelay,
    autoReconnect,
    addToast,
  ]);

  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close();
      ws.current = null;
    }
  }, []);

  const send = useCallback((data: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(data));
    } else {
      console.error("WebSocket is not connected");
    }
  }, []);

  useEffect(() => {
    // Only attempt connection if URL is valid - DISABLED FOR DEBUGGING
    if (
      url &&
      url !== "" &&
      url !== "wss://api.betproai.com/ws" &&
      !url.includes("api.betproai.com") &&
      !url.includes("localhost") &&
      !url.includes("ws://") &&
      !url.includes("wss://") &&
      import.meta.env.VITE_ENABLE_WEBSOCKET !== "false" &&
      import.meta.env.NODE_ENV !== "development"
    ) {
      connect();
    } else {
      console.log(
        "Skipping WebSocket connection due to invalid/disabled URL:",
        url,
      );
    }

    return () => {
      disconnect();
    };
  }, [connect, disconnect, url]);

  return {
    send,
    disconnect,
    reconnect: connect,
    isConnected: ws.current?.readyState === WebSocket.OPEN,
  };
};
