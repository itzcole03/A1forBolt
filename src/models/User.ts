export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: Date;
  lastActive: Date;
  preferences: {
    riskTolerance: number;
    notificationSettings: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
  statistics: {
    totalBets: number;
    winRate: number;
    averageStake: number;
    totalProfit: number;
  };
}
