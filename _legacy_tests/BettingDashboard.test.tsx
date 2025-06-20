import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BettingDashboard } from '../BettingDashboard';
import { useWebSocketStore } from '../../services/websocket';
import { useOddsStore } from '../../stores/oddsStore';
import { usePredictionStore } from '../../stores/predictionStore';
import { usePayoutStore } from '../../stores/payoutStore';
import { useRiskProfileStore } from '../../stores/riskProfileStore';

// Mock all stores
vi.mock('../../services/websocket', () => ({
  useWebSocketStore: vi.fn(),
}));

vi.mock('../../stores/oddsStore', () => ({
  useOddsStore: vi.fn(),
}));

vi.mock('../../stores/predictionStore', () => ({
  usePredictionStore: vi.fn(),
}));

vi.mock('../../stores/payoutStore', () => ({
  usePayoutStore: vi.fn(),
}));

vi.mock('../../stores/riskProfileStore', () => ({
  useRiskProfileStore: vi.fn(),
}));

describe('BettingDashboard', () => {
  const mockEventId = 'test-event-123';

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Mock WebSocket store
    (useWebSocketStore as any).mockReturnValue({
      subscribeToEvent: vi.fn(),
      unsubscribeFromEvent: vi.fn(),
      isConnected: true,
      isReconnecting: false,
      lastError: null,
    });

    // Mock Odds store
    (useOddsStore as any).mockReturnValue({
      getOddsForEvent: vi.fn().mockReturnValue({
        markets: [
          {
            market_type: 'Match Winner',
            selection: 'Home',
            odds: 2.5,
          },
        ],
      }),
    });

    // Mock Prediction store
    (usePredictionStore as any).mockReturnValue({
      getPredictionForEvent: vi.fn().mockReturnValue({
        confidence: 0.85,
        recommended_stake: 50,
        risk_level: 'MODERATE',
        shap_values: {
          home_team_form: 0.3,
        },
      }),
    });

    // Mock Payout store
    (usePayoutStore as any).mockReturnValue({
      getPayoutPreview: vi.fn().mockReturnValue({
        potential_payout: 125.5,
        kelly_stake: 25.0,
        risk_adjusted_stake: 20.0,
        expected_value: 5.5,
      }),
    });

    // Mock Risk Profile store
    (useRiskProfileStore as any).mockReturnValue({
      currentProfile: {
        profile_type: 'MODERATE',
        max_stake_percentage: 0.05,
        max_daily_loss: 100,
      },
      bankroll: 1000,
    });
  });

  it('renders all betting components', () => {
    render(<BettingDashboard eventId={mockEventId} />);

    // Check if all components are rendered
    expect(screen.getByText('Live Odds')).toBeInTheDocument();
    expect(screen.getByText('Prediction Analysis')).toBeInTheDocument();
    expect(screen.getByText('Payout Preview')).toBeInTheDocument();
  });

  it('subscribes to event updates for all components', () => {
    render(<BettingDashboard eventId={mockEventId} />);

    // Verify that each component subscribes to event updates
    expect(useWebSocketStore().subscribeToEvent).toHaveBeenCalledWith(mockEventId);
  });

  it('displays connection status', () => {
    render(<BettingDashboard eventId={mockEventId} />);

    // Check if connection status is rendered
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('handles reconnection state', () => {
    // Mock reconnecting state
    (useWebSocketStore as any).mockReturnValue({
      subscribeToEvent: vi.fn(),
      unsubscribeFromEvent: vi.fn(),
      isConnected: false,
      isReconnecting: true,
      lastError: null,
    });

    render(<BettingDashboard eventId={mockEventId} />);

    // Check if reconnecting state is displayed
    expect(screen.getByText('Reconnecting...')).toBeInTheDocument();
  });

  it('displays error state', () => {
    // Mock error state
    (useWebSocketStore as any).mockReturnValue({
      subscribeToEvent: vi.fn(),
      unsubscribeFromEvent: vi.fn(),
      isConnected: false,
      isReconnecting: false,
      lastError: 'Connection failed',
    });

    render(<BettingDashboard eventId={mockEventId} />);

    // Check if error is displayed
    expect(screen.getByText('Connection failed')).toBeInTheDocument();
  });

  it('maintains component layout on different screen sizes', () => {
    const { container } = render(<BettingDashboard eventId={mockEventId} />);

    // Check if Grid items have correct responsive classes
    const gridItems = container.getElementsByClassName('MuiGrid-item');
    expect(gridItems).toHaveLength(4); // Four main components

    // Verify responsive classes
    Array.from(gridItems).forEach(item => {
      expect(item).toHaveClass('MuiGrid-xs-12');
      expect(item).toHaveClass('MuiGrid-md-6');
    });
  });
});
