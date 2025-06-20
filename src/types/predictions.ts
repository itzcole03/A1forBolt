// Definitions for lineup builder types used throughout the app

export interface LineupBuilderStrategy {
  name: string;
  description: string;
  // Add more fields as needed based on future usage
}

export interface LineupBuilderOutput {
  id: string;
  strategy: LineupBuilderStrategy;
  legs: Array<{
    eventId: string;
    market: string;
    selection: string;
    odds: number;
    prediction: {
      probability: number;
      confidence: number;
      edge: number;
    };
  }>;
  metrics: {
    confidence: number;
    expectedValue: number;
    risk: number;
    correlation: number;
  };
  createdAt: string;
}
