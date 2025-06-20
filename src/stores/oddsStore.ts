import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { OddsData, MarketOdds } from '../types/betting';

interface OddsState {
  oddsByEvent: Record<string, OddsData>;
  setOdds: (eventId: string, odds: OddsData) => void;
  updateOdds: (eventId: string, market: MarketOdds) => void;
  getOddsForEvent: (eventId: string) => OddsData | null;
  clearOdds: (eventId: string) => void;
}

export const useOddsStore = create<OddsState>()(
  devtools(
    (set, get) => ({
      oddsByEvent: {},

      setOdds: (eventId: string, odds: OddsData) =>
        set(state => ({
          oddsByEvent: {
            ...state.oddsByEvent,
            [eventId]: odds,
          },
        })),

      updateOdds: (eventId: string, market: MarketOdds) =>
        set(state => {
          const currentOdds = state.oddsByEvent[eventId];
          if (!currentOdds) return state;

          const updatedMarkets = currentOdds.markets.map(m =>
            m.market_type === market.market_type ? market : m
          );

          return {
            oddsByEvent: {
              ...state.oddsByEvent,
              [eventId]: {
                ...currentOdds,
                markets: updatedMarkets,
                timestamp: new Date().toISOString(),
              },
            },
          };
        }),

      getOddsForEvent: (eventId: string) => {
        const state = get();
        return state.oddsByEvent[eventId] || null;
      },

      clearOdds: (eventId: string) =>
        set(state => {
          const { [eventId]: _, ...remainingOdds } = state.oddsByEvent;
          return { oddsByEvent: remainingOdds };
        }),
    }),
    { name: 'odds-store' }
  )
);
