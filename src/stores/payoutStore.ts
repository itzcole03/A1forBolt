import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useStore } from './useStore';
import { useRiskProfileStore } from './riskProfileStore';

interface PayoutData {
  potential_payout: number;
  kelly_stake: number;
  risk_adjusted_stake: number;
  expected_value: number;
}

interface BetSelection {
  eventId: string;
  odds: number;
  probability: number;
  stake?: number;
}

interface PayoutState {
  payoutPreviews: Record<string, PayoutData>;
  updatePayoutPreview: (eventId: string, data: PayoutData) => void;
  getPayoutPreview: (eventId: string) => PayoutData | undefined;
  calculateKellyStake: (odds: number, probability: number, bankroll: number) => number;
  computeAndUpdatePayoutPreview: (
    selection: BetSelection,
    bankroll: number,
    riskProfile: any
  ) => void;
}

export const usePayoutStore = create<PayoutState>()(
  devtools(
    (set, get) => ({
      payoutPreviews: {},

      updatePayoutPreview: (eventId: string, data: PayoutData) => {
        set(state => ({
          payoutPreviews: {
            ...state.payoutPreviews,
            [eventId]: data,
          },
        }));
      },

      getPayoutPreview: (eventId: string) => {
        return get().payoutPreviews[eventId];
      },

      calculateKellyStake: (odds: number, probability: number, bankroll: number) => {
        // Kelly Criterion formula: f* = (bp - q) / b
        // where b = odds - 1, p = probability of winning, q = probability of losing
        const b = odds - 1;
        const q = 1 - probability;
        const kellyFraction = (b * probability - q) / b;

        // Apply fractional Kelly (half Kelly) for more conservative staking
        const fractionalKelly = kellyFraction * 0.5;

        // Calculate stake based on bankroll
        return Math.max(0, fractionalKelly * bankroll);
      },

      computeAndUpdatePayoutPreview: (
        selection: BetSelection,
        bankroll: number,
        riskProfile: any
      ) => {
        const { eventId, odds, probability } = selection;
        // Kelly stake
        const kelly_stake = get().calculateKellyStake(odds, probability, bankroll);
        // Risk-adjusted stake (apply max stake % from risk profile)
        const maxStake = bankroll * (riskProfile?.max_stake_percentage ?? 0.05);
        const risk_adjusted_stake = Math.min(kelly_stake, maxStake);
        // Potential payout
        const potential_payout = risk_adjusted_stake * odds;
        // Expected value
        const expected_value =
          risk_adjusted_stake * (probability * odds - 1 + (1 - probability) * 0);
        // Update store
        get().updatePayoutPreview(eventId, {
          potential_payout,
          kelly_stake,
          risk_adjusted_stake,
          expected_value,
        });
      },
    }),
    { name: 'payout-store' }
  )
);
