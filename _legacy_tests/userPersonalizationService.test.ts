import { UserPersonalizationService } from '../services/analytics/userPersonalizationService';
import { User } from '../models/User';
import { Bet } from '../models/Bet';
import { Prediction } from '../models/Prediction';

describe('UserPersonalizationService', () => {
  let service: UserPersonalizationService;
  let user: User;
  let bet: Bet;
  let prediction: Prediction;

  beforeEach(() => {
    service = new UserPersonalizationService();

    user = {
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

    bet = {
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

    prediction = {
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
  });

  it('should create a new user profile when updating a non-existent user', () => {
    service.updateUserProfile(user, bet, prediction);
    const profile = service['userProfiles'].get(user.id);
    expect(profile).toBeDefined();
    expect(profile?.userId).toBe(user.id);
  });

  it('should update user profile with bet and prediction data', () => {
    service.updateUserProfile(user, bet, prediction);
    const profile = service['userProfiles'].get(user.id);
    expect(profile?.bettingBehavior.totalBets).toBe(1);
    expect(profile?.bettingBehavior.totalStake).toBe(bet.amount);
    expect(profile?.bettingBehavior.averageStake).toBe(bet.amount);
  });

  it('should generate personalized prediction', async () => {
    service.updateUserProfile(user, bet, prediction);
    const personalizedPrediction = await service.getPersonalizedPrediction(user.id, prediction);
    expect(personalizedPrediction).toBeDefined();
    expect(personalizedPrediction.probability).toBeDefined();
    expect(personalizedPrediction.confidence).toBeDefined();
    expect(personalizedPrediction.metadata.predictionBreakdown).toBeDefined();
  });

  it('should create clusters when enough user profiles exist', async () => {
    // Create multiple user profiles with varied bets
    for (let i = 0; i < 15; i++) {
      const newUser = {
        ...user,
        id: `user${i}`,
        username: `user${i}`,
        email: `user${i}@example.com`,
      };
      const variedBet = {
        ...bet,
        id: `bet${i}`,
        amount: 100 + i * 10,
        odds: 2.0 + (i % 3) * 0.2,
      };
      const variedPrediction = {
        ...prediction,
        id: `pred${i}`,
        probability: 0.6 + (i % 5) * 0.01,
        confidence: 0.8 + (i % 4) * 0.01,
      };
      service.updateUserProfile(newUser, variedBet, variedPrediction);
    }
    await service['updateClusters']();
    expect(service['clusters'].length).toBeGreaterThan(0);
  });
});
