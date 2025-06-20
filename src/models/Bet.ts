export interface Bet {
  id: string;
  userId: string;
  eventId: string;
  amount: number;
  odds: number;
  type: 'win' | 'lose' | 'draw';
  status: 'pending' | 'won' | 'lost' | 'cancelled';
  prediction: {
    probability: number;
    confidence: number;
    modelType: string;
    factors: {
      market: number;
      temporal: number;
      environmental: number;
    };
  };
}
