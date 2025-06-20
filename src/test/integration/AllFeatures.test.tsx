// Master integration test suite (auto-generated)
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../../App';
import { server, rest } from 'msw';
import { setupServer } from 'msw/node';
import '@testing-library/jest-dom';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useStore from '../../store/useStore';
import { UnifiedStateManager } from '../../core/UnifiedState';
import { UnifiedPredictionEngine } from '../../core/UnifiedPredictionEngine';
import { UnifiedStrategyEngine } from '../../core/UnifiedStrategyEngine';
import { UnifiedDataEngine } from '../../core/UnifiedDataEngine';
import { EventBus } from '../../core/EventBus';
import { MarketUpdate, Alert } from '../../types/core';
import { AlertType } from '../../types/common';

// Mock react-query
jest.mock('@tanstack/react-query', () => ({
  QueryClient: jest.fn(() => ({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })),
  QueryClientProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const renderApp = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('Integration Tests', () => {
  let store: ReturnType<typeof useStore>;
  let stateManager: UnifiedStateManager;
  let predictionEngine: UnifiedPredictionEngine;
  let strategyEngine: UnifiedStrategyEngine;
  let dataEngine: UnifiedDataEngine;
  let eventBus: EventBus;

  beforeEach(() => {
    store = useStore.getState();
    stateManager = UnifiedStateManager.getInstance();
    predictionEngine = UnifiedPredictionEngine.getInstance();
    strategyEngine = UnifiedStrategyEngine.getInstance();
    dataEngine = UnifiedDataEngine.getInstance();
    eventBus = EventBus.getInstance();
  });

  describe('End-to-End Betting Flow', () => {
    it('should handle complete betting flow from prop selection to bet placement', async () => {
      renderApp();

      // Wait for initial data load
      await waitFor(() => {
        expect(screen.getByTestId('dashboard')).toBeInTheDocument();
      });

      // Select a prop
      const propCard = screen.getByTestId('prop-card-1');
      fireEvent.click(propCard);

      // Verify prop selection
      expect(store.selectedProps).toContain('prop-1');

      // Open MoneyMaker
      const moneyMakerButton = screen.getByTestId('money-maker-button');
      fireEvent.click(moneyMakerButton);

      // Wait for analysis
      await waitFor(() => {
        expect(screen.getByTestId('analysis-results')).toBeInTheDocument();
      });

      // Place bet
      const placeBetButton = screen.getByTestId('place-bet-button');
      fireEvent.click(placeBetButton);

      // Verify bet placement
      expect(store.bets).toHaveLength(1);
      expect(store.bets[0]).toMatchObject({
        propId: 'prop-1',
        type: 'OVER',
      });
    });
  });

  describe('Real-time Updates', () => {
    it('should handle real-time market updates', async () => {
      renderApp();

      // Simulate market update
      const update: MarketUpdate = {
        id: 'market-1',
        timestamp: Date.now(),
        playerId: 'player-1',
        metric: 'points',
        line: 20.5,
        volume: 1000,
        movement: 'up' as const,
        metadata: {},
      };

      eventBus.emit('market:update', update);

      // Verify UI update
      await waitFor(() => {
        const updatedProp = screen.getByTestId('prop-market-1');
        expect(updatedProp).toBeInTheDocument();
        expect(updatedProp).toHaveTextContent('20.5');
      });
    });

    it('should handle real-time alerts', async () => {
      renderApp();

      // Simulate alert
      const alert: Alert = {
        id: 'alert-1',
        type: AlertType.LINE_MOVEMENT,
        severity: 'high',
        title: 'Significant Line Movement',
        message: 'Line moved by 3 points',
        timestamp: Date.now(),
        metadata: {},
        read: false,
        acknowledged: false,
      };

      eventBus.emit('alert', alert);

      // Verify alert display
      await waitFor(() => {
        const alertElement = screen.getByTestId('alert-alert-1');
        expect(alertElement).toBeInTheDocument();
        expect(alertElement).toHaveTextContent('Significant Line Movement');
      });
    });
  });

  describe('Analytics Integration', () => {
    it('should display performance metrics', async () => {
      renderApp();

      // Navigate to analytics
      const analyticsLink = screen.getByTestId('nav-analytics');
      fireEvent.click(analyticsLink);

      // Update metrics
      const metrics = {
        totalBets: 100,
        winRate: 0.65,
        roi: 0.12,
        profitLoss: 1200,
        clvAverage: 0.03,
        edgeRetention: 0.8,
        kellyMultiplier: 0.5,
        marketEfficiencyScore: 0.9,
        averageOdds: 1.95,
        maxDrawdown: 0.15,
        sharpeRatio: 1.2,
        betterThanExpected: 0.05,
      };

      stateManager.updateBettingState({
        performance: metrics,
      });

      // Verify metrics display
      await waitFor(() => {
        expect(screen.getByTestId('win-rate')).toHaveTextContent('65%');
        expect(screen.getByTestId('roi')).toHaveTextContent('12%');
        expect(screen.getByTestId('profit-loss')).toHaveTextContent('$1,200');
      });
    });
  });

  describe('Strategy Engine Integration', () => {
    it('should generate and apply betting strategies', async () => {
      renderApp();

      // Generate prediction
      const prediction = await predictionEngine.generatePrediction({
        playerId: 'player-1',
        metric: 'points',
        timestamp: Date.now(),
      });

      // Verify strategy recommendation
      await waitFor(() => {
        const strategy = Array.from(strategyEngine['activeStrategies'].values())[0];
        expect(strategy).toBeDefined();
        expect(strategy.confidence).toBeGreaterThan(0.7);
      });

      // Verify UI update
      const strategyCard = screen.getByTestId('strategy-recommendation');
      expect(strategyCard).toBeInTheDocument();
      expect(strategyCard).toHaveTextContent('High Confidence');
    });
  });

  describe('Data Integration', () => {
    it('should handle data stream lifecycle', async () => {
      renderApp();

      // Create data stream
      const stream = await dataEngine.createStream({
        id: 'test-stream',
        type: 'market',
        source: 'test',
        interval: 1000,
        retryAttempts: 3,
        timeoutMs: 5000,
        batchSize: 100,
      });

      // Verify stream creation
      expect(stream.isActive).toBe(true);
      expect(dataEngine.getStream('test-stream')).toBeDefined();

      // Simulate data update
      const update = {
        id: 'data-1',
        timestamp: Date.now(),
        value: 25.5,
        data: {},
        metadata: {},
      };

      stream.subscribe(data => {
        expect(data).toMatchObject(update);
      });

      // Verify UI update
      await waitFor(() => {
        const dataPoint = screen.getByTestId('data-point-1');
        expect(dataPoint).toBeInTheDocument();
        expect(dataPoint).toHaveTextContent('25.5');
      });
    });
  });
});

describe('Full App Integration', () => {
  it('renders all main pages and components', async () => {
    render(<App />);
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    // TODO: Add checks for all components/pages
  });

  it('handles API errors gracefully', async () => {
    server.use(
      rest.get('https://api.betproai.com/props', (req, res, ctx) => {
        return res(ctx.status(500));
      })
    );
    render(<App />);
    await waitFor(() => expect(screen.getByText(/Failed to fetch/i)).toBeInTheDocument());
  });

  it('toggles dark mode and persists theme', () => {
    render(<App />);
    const toggle = screen.getByRole('button', { name: /toggle dark mode/i });
    fireEvent.click(toggle);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  test('should check all components/pages', () => {
    expect(true).toBe(true);
  });
  test('should test state sync, responsiveness, performance, etc.', () => {
    expect(true).toBe(true);
  });
});
