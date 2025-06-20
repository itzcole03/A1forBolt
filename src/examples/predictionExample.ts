import { UserPersonalizationService } from '../services/analytics/userPersonalizationService';
import { User } from '../models/User';
import { Bet } from '../models/Bet';
import { Prediction } from '../models/Prediction';

async function example() {
  // Initialize services
  const userPersonalizationService = new UserPersonalizationService();

  // Create a sample user
  const user: User = {
    id: 'user123',
    username: 'johndoe',
    email: 'john@example.com',
    createdAt: new Date(),
    lastActive: new Date(),
    preferences: {
      riskTolerance: 0.7,
      notificationSettings: {
        email: true,
        push: true,
        sms: false,
      },
    },
    statistics: {
      totalBets: 0,
      winRate: 0,
      averageStake: 0,
      totalProfit: 0,
    },
  };

  // Create a sample bet
  const bet: Bet = {
    id: 'bet123',
    userId: user.id,
    eventId: 'event123',
    amount: 100,
    odds: 2.5,
    type: 'win',
    status: 'pending',
    prediction: {
      probability: 0.6,
      confidence: 0.8,
      modelType: 'ensemble',
      factors: {
        market: 0.3,
        temporal: 0.2,
        environmental: 0.1,
      },
    },
  };

  // Create a sample prediction
  const prediction: Prediction = {
    id: 'pred123',
    eventId: bet.eventId,
    modelType: 'ensemble',
    probability: 0.65,
    confidence: 0.85,
    timestamp: new Date(),
    marketFactors: {
      odds: 2.5,
      volume: 1000000,
      movement: 0.1,
    },
    temporalFactors: {
      timeToEvent: 24,
      restDays: 3,
      travelDistance: 500,
    },
    environmentalFactors: {
      weather: 0.8,
      venue: 0.9,
      crowd: 0.7,
    },
    metadata: {
      modelVersion: '1.0.0',
      features: [
        'odds',
        'volume',
        'movement',
        'timeToEvent',
        'restDays',
        'travelDistance',
        'weather',
        'venue',
        'crowd',
      ],
      shapValues: {
        odds: 0.3,
        volume: 0.2,
        movement: 0.1,
        timeToEvent: 0.05,
        restDays: 0.1,
        travelDistance: 0.05,
        weather: 0.1,
        venue: 0.05,
        crowd: 0.05,
      },
      predictionBreakdown: {
        market: 0.3,
        temporal: 0.2,
        environmental: 0.1,
        base: 0.4,
      },
    },
  };

  // Update user profile with the bet and prediction
  userPersonalizationService.updateUserProfile(user, bet, prediction);

  // Get personalized prediction
  const personalizedPrediction = await userPersonalizationService.getPersonalizedPrediction(
    user.id,
    prediction
  );

  console.log('Original Prediction:', {
    probability: prediction.probability,
    confidence: prediction.confidence,
  });

  console.log('Personalized Prediction:', {
    probability: personalizedPrediction.probability,
    confidence: personalizedPrediction.confidence,
    breakdown: personalizedPrediction.metadata.predictionBreakdown,
  });
}

// Run the example
example().catch(console.error);
