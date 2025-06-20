import { StateCreator } from 'zustand';
import { ParlayLeg } from '../../../../shared/betting';
import { bettingStrategyService } from '../../services/bettingStrategy';
import { AppStore } from '../../stores/useAppStore';

// Helper for Odds Conversion (Simplified)
const americanToDecimal = (americanOdds: number): number => {
  if (americanOdds > 0) {
    return americanOdds / 100 + 1;
  }
  return 100 / Math.abs(americanOdds) + 1;
};

export interface BetSlipSlice {
  legs: ParlayLeg[];
  stake: number;
  potentialPayout: number;
  isSubmitting: boolean;
  error: string | null; // Slice-specific error
  addLeg: (leg: ParlayLeg) => void;
  removeLeg: (propId: string, pick: 'over' | 'under') => void; // Requires pick to uniquely identify
  updateStake: (stake: number) => void;
  calculatePotentialPayout: () => void;
  clearSlip: () => void;
  submitSlip: () => Promise<boolean>; // Returns true on success, false on failure
}

export const initialBetSlipState: Pick<
  BetSlipSlice,
  'legs' | 'stake' | 'potentialPayout' | 'isSubmitting' | 'error'
> = {
  legs: [],
  stake: 0,
  potentialPayout: 0,
  isSubmitting: false,
  error: null,
};

export const createBetSlipSlice: StateCreator<AppStore, [], [], BetSlipSlice> = (set, get) => ({
  ...initialBetSlipState,
  addLeg: leg => {
    const { legs, addToast } = get();
    if (!leg.odds) {
      addToast({
        message: 'Cannot add leg without odds. Please select a valid prop line.',
        type: 'error',
      });
      console.error('Attempted to add leg without odds:', leg);
      return;
    }
    if (legs.some(l => l.propId === leg.propId && l.pick === leg.pick)) {
      addToast({ message: 'This specific pick is already in your bet slip.', type: 'warning' });
      return;
    }
    if (legs.length >= 6) {
      // Max 6 legs for PrizePicks style parlays, adjust if needed
      addToast({ message: 'Maximum 6 legs allowed in a parlay.', type: 'warning' });
      return;
    }
    set(state => ({ legs: [...state.legs, leg] }));
    get().calculatePotentialPayout();
  },
  removeLeg: (propId, pick) => {
    set(state => ({ legs: state.legs.filter(l => !(l.propId === propId && l.pick === pick)) }));
    get().calculatePotentialPayout();
  },
  updateStake: stake => {
    set({ stake: Math.max(0, stake) });
    get().calculatePotentialPayout();
  },
  calculatePotentialPayout: () => {
    const { legs, stake } = get();
    if (legs.length === 0 || stake === 0) {
      set({ potentialPayout: 0 });
      return;
    }

    // PrizePicks has fixed multipliers for N-leg parlays, not based on individual odds.
    // This is a simplified example. Real PrizePicks payout calculation is more complex.
    // For other sportsbooks, you'd multiply decimal odds.
    let multiplier = 1;
    if (legs.length === 2) multiplier = 3;
    else if (legs.length === 3) multiplier = 5;
    else if (legs.length === 4) multiplier = 10;
    else if (legs.length === 5)
      multiplier = 20; // Example, adjust based on actual PrizePicks rules
    else if (legs.length === 6)
      multiplier = 25; // Example
    else {
      // Fallback for single leg or if direct odds multiplication is desired (not typical for PrizePicks)
      // This part assumes traditional parlay calculation if not 2-6 legs for fixed multiplier
      multiplier = legs.reduce((acc, leg) => {
        if (!leg.odds) return acc; // Skip if odds are missing (should not happen with guard in addLeg)
        return acc * americanToDecimal(leg.odds);
      }, 1);
    }

    set({ potentialPayout: parseFloat((stake * multiplier).toFixed(2)) });
  },
  clearSlip: () => set({ ...initialBetSlipState }),
  submitSlip: async () => {
    const { legs, stake, addToast, clearSlip, user } = get();
    if (!user) {
      addToast({ message: 'Please log in to submit a bet.', type: 'error' });
      return false;
    }
    if (legs.length < 2 || legs.length > 6) {
      // Typical PrizePicks rules
      addToast({ message: 'Parlays must have between 2 and 6 legs.', type: 'warning' });
      return false;
    }
    if (stake <= 0) {
      addToast({ message: 'Please enter a valid stake amount.', type: 'warning' });
      return false;
    }
    set({ isSubmitting: true, error: null });
    try {
      const betInput = {
        bets: [
          {
            id: `bet_${Date.now()}`,
            description: 'User parlay',
            type: 'parlay',
            legs: legs.map(l => ({
              propId: l.propId,
              marketKey: '', // Fill as needed
              outcome: l.pick,
              odds: l.odds!,
              line: l.line,
              statType: l.statType,
              playerName: l.playerName,
            })),
            stakeSuggestion: stake,
            potentialPayout: 0, // Fill as needed
          },
        ],
      };
      const confirmation = await bettingStrategyService.placeBets(betInput);

      if (confirmation && confirmation.length > 0 && confirmation[0].success) {
        addToast({
          message: `Bet submitted successfully! ID: ${confirmation[0].betId.substring(0, 8)}`,
          type: 'success',
        });
      } else {
        addToast({ message: `Bet submission failed.`, type: 'error' });
      }
      clearSlip();
      set({ isSubmitting: false });
      return true;
    } catch (e: any) {
      const errorMsg = e.message || 'Failed to submit bet';
      set({ error: errorMsg, isSubmitting: false });
      addToast({ message: `Error submitting bet: ${errorMsg}`, type: 'error' });
      return false;
    }
  },
});
