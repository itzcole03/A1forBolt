import { RiskProfileType } from './betting';
import { SHAPExplanation, ShapFeature } from './betting';
import { BetRecommendation } from './betting';

export interface RiskProfileSelectorProps {
  currentProfile: RiskProfileType;
  onProfileChange: (profile: RiskProfileType) => void;
}

export interface ShapVisualizationProps {
  features: ShapFeature[];
  title: string;
  maxFeatures?: number;
  isLoading?: boolean;
}

export interface BettingOpportunitiesProps {
  opportunities: BetRecommendation[];
  onBetPlacement: (recommendation: BetRecommendation) => void;
  alerts: Array<{
    type: string;
    severity: string;
    message: string;
    metadata: any;
  }>;
  isLoading: boolean;
}

export interface PerformanceMetricsProps {
  performance: {
    winRate: number;
    roi: number;
    totalBets: number;
    confidence: number;
  };
  isLoading: boolean;
}

export interface LiveOddsTickerProps {
  eventId: string;
  data?: {
    event_id: string;
    markets: Array<{
      market_type: string;
      selection: string;
      odds: number;
    }>;
    timestamp: string;
  };
  className?: string;
}
