import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Bet, BetSlip, Odds, Sport, Event } from '../types/betting';

interface BettingState {
  // Active bets
  activeBets: Bet[];
  betSlip: BetSlip;
  selectedSport: Sport | null;
  selectedEvent: Event | null;
  odds: Record<string, Odds>;

  // Actions
  addBet: (bet: Bet) => void;
  removeBet: (betId: string) => void;
  updateOdds: (eventId: string, odds: Odds) => void;
  selectSport: (sport: Sport) => void;
  selectEvent: (event: Event) => void;
  clearBetSlip: () => void;
  updateBetAmount: (betId: string, amount: number) => void;
}

export const useBettingStore = create<BettingState>()(
  devtools(
    persist(
      set => ({
        activeBets: [],
        betSlip: {
          bets: [],
          totalStake: 0,
          potentialWinnings: 0,
        },
        selectedSport: null,
        selectedEvent: null,
        odds: {},

        addBet: bet =>
          set(state => {
            const newBetSlip = {
              ...state.betSlip,
              bets: [...state.betSlip.bets, bet],
              totalStake: state.betSlip.totalStake + bet.stake,
              potentialWinnings: state.betSlip.potentialWinnings + bet.potentialWinnings,
            };
            return { betSlip: newBetSlip };
          }),

        removeBet: betId =>
          set(state => {
            const betToRemove = state.betSlip.bets.find(b => b.id === betId);
            if (!betToRemove) return state;

            const newBetSlip = {
              ...state.betSlip,
              bets: state.betSlip.bets.filter(b => b.id !== betId),
              totalStake: state.betSlip.totalStake - betToRemove.stake,
              potentialWinnings: state.betSlip.potentialWinnings - betToRemove.potentialWinnings,
            };
            return { betSlip: newBetSlip };
          }),

        updateOdds: (eventId, odds) =>
          set(state => ({
            odds: { ...state.odds, [eventId]: odds },
          })),

        selectSport: sport =>
          set(() => ({
            selectedSport: sport,
            selectedEvent: null,
          })),

        selectEvent: event =>
          set(() => ({
            selectedEvent: event,
          })),

        clearBetSlip: () =>
          set(() => ({
            betSlip: {
              bets: [],
              totalStake: 0,
              potentialWinnings: 0,
            },
          })),

        updateBetAmount: (betId, amount) =>
          set(state => {
            const betIndex = state.betSlip.bets.findIndex(b => b.id === betId);
            if (betIndex === -1) return state;

            const updatedBets = [...state.betSlip.bets];
            const oldStake = updatedBets[betIndex].stake;
            updatedBets[betIndex] = {
              ...updatedBets[betIndex],
              stake: amount,
              potentialWinnings: amount * updatedBets[betIndex].odds,
            };

            return {
              betSlip: {
                ...state.betSlip,
                bets: updatedBets,
                totalStake: state.betSlip.totalStake - oldStake + amount,
                potentialWinnings: updatedBets.reduce((sum, bet) => sum + bet.potentialWinnings, 0),
              },
            };
          }),
      }),
      {
        name: 'betting-storage',
        partialize: state => ({
          activeBets: state.activeBets,
          betSlip: state.betSlip,
        }),
      }
    )
  )
);
