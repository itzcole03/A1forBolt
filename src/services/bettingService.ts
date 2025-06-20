import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import type { Bet, Event, Sport, Odds } from "../types/betting";

const API_URL = import.meta.env.VITE_API_URL;

const bettingApi = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// API endpoints
const endpoints = {
  sports: "/sports",
  events: "/events",
  odds: "/odds",
  bets: "/bets",
};

// Queries
export const useSports = () => {
  return useQuery({
    queryKey: ["sports"],
    queryFn: async () => {
      const { data } = await bettingApi.get<Sport[]>(endpoints.sports);
      return data;
    },
  });
};

export const useEvents = (sportId: string) => {
  return useQuery({
    queryKey: ["events", sportId],
    queryFn: async () => {
      const { data } = await bettingApi.get<Event[]>(
        `${endpoints.events}?sportId=${sportId}`,
      );
      return data;
    },
    enabled: !!sportId,
  });
};

export const useOdds = (eventId: string) => {
  return useQuery({
    queryKey: ["odds", eventId],
    queryFn: async () => {
      const { data } = await bettingApi.get<Odds>(
        `${endpoints.odds}/${eventId}`,
      );
      return data;
    },
    enabled: !!eventId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });
};

export const useActiveBets = () => {
  return useQuery({
    queryKey: ["bets", "active"],
    queryFn: async () => {
      const { data } = await bettingApi.get<Bet[]>(`${endpoints.bets}/active`);
      return data;
    },
  });
};

// Mutations
export const usePlaceBet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bet: Omit<Bet, "id" | "status" | "timestamp">) => {
      const { data } = await bettingApi.post<Bet>(endpoints.bets, bet);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bets", "active"] });
    },
  });
};

export const useCancelBet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (betId: string) => {
      const { data } = await bettingApi.post<Bet>(
        `${endpoints.bets}/${betId}/cancel`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bets", "active"] });
    },
  });
};

// WebSocket connection for real-time updates
export const connectToOddsWebSocket = (
  eventId: string,
  onUpdate: (odds: Odds) => void,
) => {
  const wsUrl = `${import.meta.env.VITE_WS_URL}/odds/${eventId}`;

  // Safety checks to prevent invalid WebSocket connections
  if (
    !wsUrl ||
    wsUrl === "" ||
    wsUrl === "wss://api.betproai.com/ws" ||
    wsUrl.includes("api.betproai.com") ||
    wsUrl.includes("localhost:8000") ||
    wsUrl.includes("localhost:3001") ||
    wsUrl.includes("undefined") ||
    import.meta.env.VITE_ENABLE_WEBSOCKET === "false"
  ) {
    console.log("WebSocket connection disabled for odds updates:", wsUrl);
    return () => {}; // Return empty cleanup function
  }

  const ws = new WebSocket(wsUrl);

  ws.onmessage = (event) => {
    const odds: Odds = JSON.parse(event.data);
    onUpdate(odds);
  };

  return () => {
    ws.close();
  };
};
