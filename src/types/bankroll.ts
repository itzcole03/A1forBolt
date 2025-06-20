export interface Transaction {
  id: string;
  amount: number;
  type: 'deposit' | 'withdraw' | 'win' | 'loss' | 'bet';
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
  description?: string;
}

export interface BankrollSettings {
  maxBetPercentage: number;
  stopLossPercentage: number;
  takeProfitPercentage: number;
  kellyFraction: number;
}

export interface BankrollStats {
  currentBalance: number;
  startingBalance: number;
  totalWins: number;
  totalLosses: number;
  winRate: number;
  averageBetSize: number;
  largestWin: number;
  largestLoss: number;
  netProfit: number;
  roi: number;
}
