import { BettingAutomationService } from '../services/automation/BettingAutomationService';
import { userPersonalizationService } from '../services/analytics/userPersonalizationService';
import { predictionOptimizationService } from '../services/analytics/predictionOptimizationService';
import { riskManagementService } from '../services/riskManagement';
import { bankrollService } from '../services/bankroll';
import { notificationService } from '../services/notification';
import { unifiedBettingCore } from '../services/unified/UnifiedBettingCore';

jest.mock('../services/analytics/userPersonalizationService');
jest.mock('../services/analytics/predictionOptimizationService');
jest.mock('../services/riskManagement');
jest.mock('../services/bankroll');
jest.mock('../services/notification');
jest.mock('../services/unified/UnifiedBettingCore');

describe('BettingAutomationService', () => {
  let service: BettingAutomationService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = BettingAutomationService.getInstance();
  });

  it('should start automation successfully', async () => {
    // Mock service initializations
    (userPersonalizationService.initialize as jest.Mock) = jest.fn().mockResolvedValue(undefined);
    (predictionOptimizationService.initialize as jest.Mock) = jest
      .fn()
      .mockResolvedValue(undefined);
    (riskManagementService.initialize as jest.Mock) = jest.fn().mockResolvedValue(undefined);
    (bankrollService.initialize as jest.Mock) = jest.fn().mockResolvedValue(undefined);
    (unifiedBettingCore.initialize as jest.Mock) = jest.fn().mockResolvedValue(undefined);

    // Mock notification service
    (notificationService.notify as jest.Mock) = jest.fn();

    await service.start();

    expect(notificationService.notify).toHaveBeenCalledWith('info', 'Betting automation started');
    expect(userPersonalizationService.initialize).toHaveBeenCalled();
    expect(predictionOptimizationService.initialize).toHaveBeenCalled();
    expect(riskManagementService.initialize).toHaveBeenCalled();
    expect(bankrollService.initialize).toHaveBeenCalled();
    expect(unifiedBettingCore.initialize).toHaveBeenCalled();
  });

  it('should stop automation successfully', async () => {
    // Mock notification service
    (notificationService.notify as jest.Mock) = jest.fn();

    await service.stop();

    expect(notificationService.notify).toHaveBeenCalledWith('info', 'Betting automation stopped');
  });

  it('should handle stop loss event', async () => {
    // Mock bankroll service
    (bankrollService.checkStopLoss as jest.Mock) = jest.fn().mockReturnValue(true);
    (notificationService.notify as jest.Mock) = jest.fn();

    await service.start();
    service['checkBankrollLimits']();

    expect(notificationService.notify).toHaveBeenCalledWith('warning', 'Stop loss reached');
  });

  it('should handle take profit event', async () => {
    // Mock bankroll service
    (bankrollService.checkTakeProfit as jest.Mock) = jest.fn().mockReturnValue(true);
    (notificationService.notify as jest.Mock) = jest.fn();

    await service.start();
    service['checkBankrollLimits']();

    expect(notificationService.notify).toHaveBeenCalledWith('success', 'Take profit reached');
  });

  it('should process predictions and place bets when conditions are met', async () => {
    // Mock prediction service
    const mockPrediction = {
      userId: 'user123',
      probability: 0.8,
      confidence: 0.9,
    };
    (predictionOptimizationService.getOptimizedPrediction as jest.Mock) = jest
      .fn()
      .mockResolvedValue([mockPrediction]);

    // Mock user personalization service
    (userPersonalizationService.getPersonalizedPrediction as jest.Mock) = jest
      .fn()
      .mockResolvedValue(mockPrediction);

    // Mock risk management service
    const mockRiskAssessment = {
      riskLevel: 'low',
      expectedValue: 0.1,
      confidence: 0.8,
      maxStake: 100,
      recommendedStake: 50,
    };
    (riskManagementService.assessRisk as jest.Mock) = jest
      .fn()
      .mockResolvedValue(mockRiskAssessment);

    // Mock unified betting core
    (unifiedBettingCore.placeBet as jest.Mock) = jest.fn().mockResolvedValue(undefined);

    await service.start();
    await service['performUpdate']();

    expect(unifiedBettingCore.placeBet).toHaveBeenCalledWith({
      prediction: mockPrediction,
      stake: 50,
      riskAssessment: mockRiskAssessment,
    });
  });

  it('should not place bet when risk assessment indicates high risk', async () => {
    // Mock prediction service
    const mockPrediction = {
      userId: 'user123',
      probability: 0.8,
      confidence: 0.9,
    };
    (predictionOptimizationService.getOptimizedPrediction as jest.Mock) = jest
      .fn()
      .mockResolvedValue([mockPrediction]);

    // Mock user personalization service
    (userPersonalizationService.getPersonalizedPrediction as jest.Mock) = jest
      .fn()
      .mockResolvedValue(mockPrediction);

    // Mock risk management service with high risk
    const mockRiskAssessment = {
      riskLevel: 'high',
      expectedValue: 0.1,
      confidence: 0.8,
      maxStake: 100,
      recommendedStake: 50,
    };
    (riskManagementService.assessRisk as jest.Mock) = jest
      .fn()
      .mockResolvedValue(mockRiskAssessment);

    // Mock unified betting core
    (unifiedBettingCore.placeBet as jest.Mock) = jest.fn().mockResolvedValue(undefined);

    await service.start();
    await service['performUpdate']();

    expect(unifiedBettingCore.placeBet).not.toHaveBeenCalled();
  });

  it('should handle errors during update cycle', async () => {
    // Mock prediction service to throw error
    (predictionOptimizationService.getOptimizedPrediction as jest.Mock) = jest
      .fn()
      .mockRejectedValue(new Error('Test error'));
    (notificationService.notify as jest.Mock) = jest.fn();

    await service.start();
    await service['performUpdate']();

    expect(notificationService.notify).toHaveBeenCalledWith(
      'error',
      'Error in update cycle',
      expect.any(Object)
    );
  });
});
