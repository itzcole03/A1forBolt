import { MarketAnalysisService } from '../marketAnalysisService';
import { BettingOdds } from '../../types/betting';

describe('MarketAnalysisService', () => {
  let service: MarketAnalysisService;
  const mockEventId = 'test-event-1';
  const mockOdds: BettingOdds[] = [
    {
      bookmaker: 'book1',
      eventId: mockEventId,
      market: 'market1',
      selection: 'selection1',
      odds: 2.0,
      timestamp: Date.now(),
      volume: 1000,
      maxStake: 5000,
    },
    {
      bookmaker: 'book2',
      eventId: mockEventId,
      market: 'market1',
      selection: 'selection1',
      odds: 2.1,
      timestamp: Date.now(),
      volume: 800,
      maxStake: 4000,
    },
  ];

  beforeEach(() => {
    service = MarketAnalysisService.getInstance();
  });

  describe('updateMarketMetrics', () => {
    it('should update market metrics correctly', () => {
      service.updateMarketMetrics(mockEventId, mockOdds);
      const metrics = service.getMarketMetrics(mockEventId);

      expect(metrics).toBeDefined();
      expect(metrics?.volume.totalVolume).toBe(1800); // 1000 + 800
      expect(metrics?.volume.volumeHistory.length).toBe(1);
    });

    it('should calculate liquidity correctly', () => {
      service.updateMarketMetrics(mockEventId, mockOdds);
      const metrics = service.getMarketMetrics(mockEventId);

      // Liquidity = totalStake / spread
      // totalStake = 5000 + 4000 = 9000
      // spread = 2.1 - 2.0 = 0.1
      // expected liquidity = 9000 / 0.1 = 90000
      expect(metrics?.liquidity).toBe(90000);
    });
  });

  describe('anomaly detection', () => {
    it('should detect volume anomalies', () => {
      // First update with normal volume
      service.updateMarketMetrics(mockEventId, mockOdds);

      // Update with unusually high volume
      const highVolumeOdds: BettingOdds[] = [
        {
          ...mockOdds[0],
          volume: 10000, // Much higher than previous volumes
        },
        {
          ...mockOdds[1],
          volume: 8000,
        },
      ];

      service.updateMarketMetrics(mockEventId, highVolumeOdds);
      const anomalies = service.getAnomalies(mockEventId);

      expect(anomalies.length).toBeGreaterThan(0);
      expect(anomalies[0].type).toBe('volume');
      expect(anomalies[0].severity).toBe('high');
    });
  });

  describe('market efficiency', () => {
    it('should calculate market efficiency metrics', () => {
      service.updateMarketMetrics(mockEventId, mockOdds);
      const efficiency = service.getMarketEfficiency(mockEventId);

      expect(efficiency).toBeDefined();
      expect(efficiency?.spreadEfficiency).toBeGreaterThan(0);
      expect(efficiency?.volumeEfficiency).toBeGreaterThan(0);
      expect(efficiency?.priceDiscovery).toBeGreaterThanOrEqual(0);
      expect(efficiency?.marketDepth).toBeGreaterThan(0);
    });

    it('should calculate spread efficiency correctly', () => {
      service.updateMarketMetrics(mockEventId, mockOdds);
      const efficiency = service.getMarketEfficiency(mockEventId);

      // Spread = 0.1, mid price = 2.05
      // Expected spread efficiency = 1 - (0.1 / 2.05) ≈ 0.951
      expect(efficiency?.spreadEfficiency).toBeCloseTo(0.951, 2);
    });
  });

  describe('trend analysis', () => {
    it('should calculate trend correctly', () => {
      // First update
      service.updateMarketMetrics(mockEventId, mockOdds);

      // Second update with increasing volume
      const increasedVolumeOdds: BettingOdds[] = [
        {
          ...mockOdds[0],
          volume: 1200,
        },
        {
          ...mockOdds[1],
          volume: 1000,
        },
      ];

      service.updateMarketMetrics(mockEventId, increasedVolumeOdds);
      const metrics = service.getMarketMetrics(mockEventId);

      expect(metrics?.trend).toBeGreaterThan(0); // Positive trend
    });
  });

  describe('volatility calculation', () => {
    it('should calculate volatility correctly', () => {
      // First update
      service.updateMarketMetrics(mockEventId, mockOdds);

      // Second update with different volume
      const differentVolumeOdds: BettingOdds[] = [
        {
          ...mockOdds[0],
          volume: 1500,
        },
        {
          ...mockOdds[1],
          volume: 1200,
        },
      ];

      service.updateMarketMetrics(mockEventId, differentVolumeOdds);
      const metrics = service.getMarketMetrics(mockEventId);

      expect(metrics?.volatility).toBeGreaterThan(0);
    });
  });
});
