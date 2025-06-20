import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MarketAnalysisDashboard } from '../MarketAnalysisDashboard';
import { MarketAnalysisService } from '../../services/marketAnalysisService';
import { MarketMetrics, MarketEfficiencyMetrics, MarketAnomaly } from '../../types/betting';

// Mock the MarketAnalysisService
jest.mock('../../services/marketAnalysisService', () => ({
  MarketAnalysisService: {
    getInstance: jest.fn(() => ({
      getMarketMetrics: jest.fn(),
      getMarketEfficiency: jest.fn(),
      getAnomalies: jest.fn(),
      on: jest.fn(),
      removeListener: jest.fn(),
    })),
  },
}));

interface MockMarketAnalysisService {
  getMarketMetrics: jest.Mock<MarketMetrics | undefined, [string]>;
  getMarketEfficiency: jest.Mock<MarketEfficiencyMetrics | undefined, [string]>;
  getAnomalies: jest.Mock<MarketAnomaly[], [string]>;
  on: jest.Mock<void, [string, (data: any) => void]>;
  removeListener: jest.Mock<void, [string, (data: any) => void]>;
}

describe('MarketAnalysisDashboard', () => {
  const mockEventId = 'test-event-1';
  const mockMetrics: MarketMetrics = {
    volume: {
      totalVolume: 1800,
      lastUpdate: Date.now(),
      volumeHistory: [
        { timestamp: Date.now() - 1000, volume: 1000 },
        { timestamp: Date.now(), volume: 800 },
      ],
    },
    liquidity: 90000,
    volatility: 141.42,
    trend: 0.5,
  };

  const mockEfficiency: MarketEfficiencyMetrics = {
    spreadEfficiency: 0.951,
    volumeEfficiency: 0.8,
    priceDiscovery: 0.6,
    marketDepth: 0.7,
  };

  const mockAnomalies: MarketAnomaly[] = [
    {
      type: 'volume',
      severity: 'high',
      description: 'Unusual volume detected: 2.5 standard deviations from mean',
      timestamp: Date.now(),
      metrics: {
        current: 10000,
        expected: 5000,
        deviation: 2.5,
      },
    },
  ];

  let mockService: MockMarketAnalysisService;

  beforeEach(() => {
    mockService = MarketAnalysisService.getInstance() as unknown as MockMarketAnalysisService;
    mockService.getMarketMetrics.mockReturnValue(mockMetrics);
    mockService.getMarketEfficiency.mockReturnValue(mockEfficiency);
    mockService.getAnomalies.mockReturnValue(mockAnomalies);
  });

  it('renders loading state initially', () => {
    mockService.getMarketMetrics.mockReturnValue(undefined);

    render(<MarketAnalysisDashboard eventId={mockEventId} />);
    expect(screen.getByText('Loading market data...')).toBeInTheDocument();
  });

  it('renders market metrics correctly', async () => {
    render(<MarketAnalysisDashboard eventId={mockEventId} />);

    await waitFor(() => {
      expect(screen.getByText('Market Metrics')).toBeInTheDocument();
      expect(screen.getByText('90,000')).toBeInTheDocument(); // Liquidity
      expect(screen.getByText('141.42')).toBeInTheDocument(); // Volatility
      expect(screen.getByText('↑ 0.50')).toBeInTheDocument(); // Trend
    });
  });

  it('renders anomalies correctly', async () => {
    render(<MarketAnalysisDashboard eventId={mockEventId} />);

    await waitFor(() => {
      expect(screen.getByText('VOLUME Anomaly')).toBeInTheDocument();
      expect(screen.getByText(/Unusual volume detected/)).toBeInTheDocument();
    });
  });

  it('renders market efficiency chart', async () => {
    render(<MarketAnalysisDashboard eventId={mockEventId} />);

    await waitFor(() => {
      expect(screen.getByText('Market Efficiency')).toBeInTheDocument();
      expect(screen.getByText('Spread Efficiency')).toBeInTheDocument();
      expect(screen.getByText('Volume Efficiency')).toBeInTheDocument();
      expect(screen.getByText('Price Discovery')).toBeInTheDocument();
      expect(screen.getByText('Market Depth')).toBeInTheDocument();
    });
  });

  it('updates when market efficiency changes', async () => {
    render(<MarketAnalysisDashboard eventId={mockEventId} />);

    const newEfficiency: MarketEfficiencyMetrics = {
      ...mockEfficiency,
      spreadEfficiency: 0.98,
    };

    // Simulate market efficiency update
    const handleMarketEfficiency = mockService.on.mock.calls.find(
      (call: [string, (data: any) => void]) => call[0] === 'marketEfficiency'
    )?.[1];

    if (handleMarketEfficiency) {
      handleMarketEfficiency({ eventId: mockEventId, metrics: newEfficiency });
    }

    await waitFor(() => {
      expect(screen.getByText('Market Efficiency')).toBeInTheDocument();
    });
  });

  it('updates when anomalies are detected', async () => {
    render(<MarketAnalysisDashboard eventId={mockEventId} />);

    const newAnomalies: MarketAnomaly[] = [
      {
        type: 'price',
        severity: 'medium',
        description: 'Price movement anomaly detected',
        timestamp: Date.now(),
        metrics: {
          current: 2.5,
          expected: 2.0,
          deviation: 2.1,
        },
      },
    ];

    // Simulate anomaly detection
    const handleMarketAnomaly = mockService.on.mock.calls.find(
      (call: [string, (data: any) => void]) => call[0] === 'marketAnomaly'
    )?.[1];

    if (handleMarketAnomaly) {
      handleMarketAnomaly({ eventId: mockEventId, anomalies: newAnomalies });
    }

    await waitFor(() => {
      expect(screen.getByText('PRICE Anomaly')).toBeInTheDocument();
      expect(screen.getByText(/Price movement anomaly detected/)).toBeInTheDocument();
    });
  });
});
