import { BettingOpportunityService } from '../bettingOpportunityService';
import { ArbitrageService } from '../ArbitrageService';
import { LineShoppingService } from '../lineShoppingService';
import { PredictionService } from '../predictionService';
import { AdvancedPredictionService } from '../advancedPredictionService';
import { NotificationManager } from '../notification/notificationManager';
import {
  BettingOdds,
  ArbitrageOpportunity,
  LineShoppingResult,
  Sportsbook,
} from '../../types/betting';
import { MarketContext, BettingContext } from '../../types/core';

jest.mock('../ArbitrageService');
jest.mock('../lineShoppingService');
jest.mock('../predictionService');
jest.mock('../advancedPredictionService');
jest.mock('../notification/notificationManager');

describe('BettingOpportunityService', () => {
  let service: BettingOpportunityService;
  let mockArbitrageService: jest.Mocked<ArbitrageService>;
  let mockLineShoppingService: jest.Mocked<LineShoppingService>;
  let mockPredictionService: jest.Mocked<PredictionService>;
  let mockAdvancedPredictionService: jest.Mocked<AdvancedPredictionService>;
  let mockNotificationManager: jest.Mocked<NotificationManager>;

  beforeEach(() => {
    jest.clearAllMocks();
    service = BettingOpportunityService.getInstance();
    mockArbitrageService = ArbitrageService.getInstance() as jest.Mocked<ArbitrageService>;
    mockLineShoppingService = new LineShoppingService() as jest.Mocked<LineShoppingService>;
    mockPredictionService = PredictionService.getInstance() as jest.Mocked<PredictionService>;
    mockAdvancedPredictionService =
      AdvancedPredictionService.getInstance() as jest.Mocked<AdvancedPredictionService>;
    mockNotificationManager = new NotificationManager() as jest.Mocked<NotificationManager>;
  });

  describe('startMonitoring', () => {
    it('should start monitoring and notify', () => {
      service.startMonitoring();
      expect(mockNotificationManager.notifySystemAlert).toHaveBeenCalledWith(
        'Monitoring Started',
        'Betting opportunity monitoring has been activated',
        'low'
      );
      expect(service.isActive()).toBe(true);
    });
  });

  describe('stopMonitoring', () => {
    it('should stop monitoring and notify', () => {
      service.startMonitoring();
      service.stopMonitoring();
      expect(mockNotificationManager.notifySystemAlert).toHaveBeenCalledWith(
        'Monitoring Stopped',
        'Betting opportunity monitoring has been deactivated',
        'low'
      );
      expect(service.isActive()).toBe(false);
    });
  });

  describe('handleArbitrageOpportunity', () => {
    it('should notify and emit when monitoring is active', () => {
      const mockOpportunity: ArbitrageOpportunity = {
        id: '1',
        legs: [
          {
            bookId: 'bookie1',
            propId: 'prop1',
            odds: 2.0,
            stake: 100,
            maxStake: 1000,
            timestamp: Date.now(),
          },
        ],
        profitMargin: 0.1,
        totalStake: 1000,
        expectedProfit: 100,
        risk: {
          exposure: 1000,
          confidence: 0.8,
          timeSensitivity: 0.5,
        },
        status: 'pending',
        timestamp: Date.now(),
      };

      service.startMonitoring();
      mockArbitrageService.emit('newOpportunity', mockOpportunity);

      expect(mockNotificationManager.notifyArbitrageOpportunity).toHaveBeenCalledWith(
        mockOpportunity
      );
    });

    it('should not notify or emit when monitoring is inactive', () => {
      const mockOpportunity: ArbitrageOpportunity = {
        id: '1',
        legs: [
          {
            bookId: 'bookie1',
            propId: 'prop1',
            odds: 2.0,
            stake: 100,
            maxStake: 1000,
            timestamp: Date.now(),
          },
        ],
        profitMargin: 0.1,
        totalStake: 1000,
        expectedProfit: 100,
        risk: {
          exposure: 1000,
          confidence: 0.8,
          timeSensitivity: 0.5,
        },
        status: 'pending',
        timestamp: Date.now(),
      };

      mockArbitrageService.emit('newOpportunity', mockOpportunity);

      expect(mockNotificationManager.notifyArbitrageOpportunity).not.toHaveBeenCalled();
    });
  });

  describe('handleOddsUpdate', () => {
    const mockOdds: BettingOdds[] = [
      {
        bookmaker: 'bookie1',
        eventId: 'event1',
        market: 'market1',
        selection: 'selection1',
        odds: 2.0,
        timestamp: Date.now(),
      },
    ];

    it('should update services and generate predictions when monitoring is active', () => {
      service.startMonitoring();
      mockLineShoppingService.emit('oddsUpdated', { bookmakerId: 'bookie1', odds: mockOdds });

      expect(mockArbitrageService.monitorOpportunities).toHaveBeenCalled();
      expect(mockLineShoppingService.findBestOdds).toHaveBeenCalled();
      expect(mockPredictionService.generatePrediction).toHaveBeenCalled();
      expect(mockAdvancedPredictionService.generateAdvancedPrediction).toHaveBeenCalled();
    });

    it('should not update services when monitoring is inactive', () => {
      mockLineShoppingService.emit('oddsUpdated', { bookmakerId: 'bookie1', odds: mockOdds });

      expect(mockArbitrageService.monitorOpportunities).not.toHaveBeenCalled();
      expect(mockLineShoppingService.findBestOdds).not.toHaveBeenCalled();
      expect(mockPredictionService.generatePrediction).not.toHaveBeenCalled();
      expect(mockAdvancedPredictionService.generateAdvancedPrediction).not.toHaveBeenCalled();
    });
  });

  describe('handlePrediction', () => {
    it('should notify and emit when monitoring is active', () => {
      const mockPrediction = {
        propId: 'prop1',
        confidence: 0.8,
      };

      service.startMonitoring();
      mockPredictionService.emit('newPrediction', mockPrediction);

      expect(mockNotificationManager.notifyModelUpdate).toHaveBeenCalledWith(
        `New prediction for ${mockPrediction.propId}`,
        `Confidence: ${(mockPrediction.confidence * 100).toFixed(1)}%`
      );
    });

    it('should not notify or emit when monitoring is inactive', () => {
      const mockPrediction = {
        propId: 'prop1',
        confidence: 0.8,
      };

      mockPredictionService.emit('newPrediction', mockPrediction);

      expect(mockNotificationManager.notifyModelUpdate).not.toHaveBeenCalled();
    });
  });

  describe('handleAdvancedPrediction', () => {
    it('should notify and emit when monitoring is active', () => {
      const mockAdvancedPrediction = {
        basePrediction: {
          propId: 'prop1',
        },
        confidence: 0.85,
        expectedValue: 0.1,
        riskAdjustedScore: 0.75,
      };

      service.startMonitoring();
      mockAdvancedPredictionService.emit('newAdvancedPrediction', mockAdvancedPrediction);

      const expectedMessage = [
        `Advanced prediction for ${mockAdvancedPrediction.basePrediction.propId}`,
        `Confidence: ${(mockAdvancedPrediction.confidence * 100).toFixed(1)}%`,
        `Expected Value: ${(mockAdvancedPrediction.expectedValue * 100).toFixed(1)}%`,
        `Risk Score: ${(mockAdvancedPrediction.riskAdjustedScore * 100).toFixed(1)}%`,
      ].join('\n');

      expect(mockNotificationManager.notifyModelUpdate).toHaveBeenCalledWith(
        'New Advanced Prediction',
        expectedMessage
      );
    });

    it('should not notify or emit when monitoring is inactive', () => {
      const mockAdvancedPrediction = {
        basePrediction: {
          propId: 'prop1',
        },
        confidence: 0.85,
        expectedValue: 0.1,
        riskAdjustedScore: 0.75,
      };

      mockAdvancedPredictionService.emit('newAdvancedPrediction', mockAdvancedPrediction);

      expect(mockNotificationManager.notifyModelUpdate).not.toHaveBeenCalled();
    });
  });

  describe('registerSportsbook', () => {
    it('should register sportsbook with line shopping service', () => {
      const mockSportsbook: Sportsbook = {
        id: 'bookie1',
        name: 'Bookie 1',
        baseUrl: 'https://bookie1.com',
        supportedMarkets: ['market1'],
        maxStake: 1000,
        minStake: 10,
        commission: 0.05,
      };

      service.registerSportsbook(mockSportsbook);

      expect(mockLineShoppingService.registerSportsbook).toHaveBeenCalledWith(mockSportsbook);
    });
  });

  describe('updateNotificationPreferences', () => {
    it('should update notification preferences', () => {
      const mockPreferences = {
        arbitrage: true,
        lineShopping: true,
      };

      service.updateNotificationPreferences(mockPreferences);

      expect(mockNotificationManager.updatePreferences).toHaveBeenCalledWith(mockPreferences);
    });
  });

  describe('cleanup', () => {
    it('should clear expired data from all services', () => {
      service.cleanup();

      expect(mockArbitrageService.clearExpiredOpportunities).toHaveBeenCalled();
      expect(mockLineShoppingService.clearExpiredOdds).toHaveBeenCalled();
      expect(mockPredictionService.clearPredictions).toHaveBeenCalled();
    });
  });
});
