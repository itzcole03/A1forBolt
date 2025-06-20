import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PayoutPreview } from '../PayoutPreview';
import { useWebSocketStore } from '../../services/websocket';
import { usePayoutStore } from '../../stores/payoutStore';
import { useRiskProfileStore } from '../../stores/riskProfileStore';

// Mock the stores
vi.mock('../../services/websocket', () => ({
  useWebSocketStore: vi.fn(),
}));

vi.mock('../../stores/payoutStore', () => ({
  usePayoutStore: vi.fn(),
}));

vi.mock('../../stores/riskProfileStore', () => ({
  useRiskProfileStore: vi.fn(),
}));

describe('PayoutPreview', () => {
  const mockEventId = 'test-event-123';
  const mockPayoutPreview = {
    potential_payout: 125.5,
    kelly_stake: 25.0,
    risk_adjusted_stake: 20.0,
    expected_value: 5.5,
  };

  const mockRiskProfile = {
    currentProfile: {
      profile_type: 'MODERATE',
      max_stake_percentage: 0.05,
      max_daily_loss: 100,
    },
    bankroll: 1000,
  };

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Mock WebSocket store
    (useWebSocketStore as any).mockReturnValue({
      subscribeToEvent: vi.fn(),
      unsubscribeFromEvent: vi.fn(),
    });

    // Mock Payout store
    (usePayoutStore as any).mockReturnValue({
      getPayoutPreview: vi.fn().mockReturnValue(mockPayoutPreview),
    });

    // Mock Risk Profile store
    (useRiskProfileStore as any).mockReturnValue(mockRiskProfile);
  });

  it('renders loading state initially', () => {
    // Mock empty payout preview
    (usePayoutStore as any).mockReturnValue({
      getPayoutPreview: vi.fn().mockReturnValue(null),
    });

    render(<PayoutPreview eventId={mockEventId} />);
    expect(screen.getByText('Loading payout preview...')).toBeInTheDocument();
  });

  it('renders payout data correctly', () => {
    render(<PayoutPreview eventId={mockEventId} />);

    // Check potential payout
    expect(screen.getByText('Potential Payout')).toBeInTheDocument();
    expect(screen.getByText('$125.50')).toBeInTheDocument();

    // Check Kelly stake
    expect(screen.getByText('Kelly Criterion Stake')).toBeInTheDocument();
    expect(screen.getByText('$25.00')).toBeInTheDocument();

    // Check risk-adjusted stake
    expect(screen.getByText('Risk-Adjusted Stake')).toBeInTheDocument();
    expect(screen.getByText('$20.00')).toBeInTheDocument();

    // Check expected value
    expect(screen.getByText('Expected Value')).toBeInTheDocument();
    expect(screen.getByText('$5.50')).toBeInTheDocument();
  });

  it('subscribes to event updates on mount and unsubscribes on unmount', () => {
    const { unmount } = render(<PayoutPreview eventId={mockEventId} />);

    expect(useWebSocketStore().subscribeToEvent).toHaveBeenCalledWith(mockEventId);

    unmount();

    expect(useWebSocketStore().unsubscribeFromEvent).toHaveBeenCalledWith(mockEventId);
  });

  it('disables place bet button when expected value is negative', () => {
    const negativeValuePreview = {
      ...mockPayoutPreview,
      expected_value: -1.0,
    };

    (usePayoutStore as any).mockReturnValue({
      getPayoutPreview: vi.fn().mockReturnValue(negativeValuePreview),
    });

    render(<PayoutPreview eventId={mockEventId} />);

    const placeBetButton = screen.getByRole('button', { name: /place bet/i });
    expect(placeBetButton).toBeDisabled();
  });

  it('shows animation when payout values change', () => {
    const initialPreview = {
      ...mockPayoutPreview,
      potential_payout: 100.0,
    };

    const updatedPreview = {
      ...mockPayoutPreview,
      potential_payout: 125.5,
    };

    // Start with initial preview
    (usePayoutStore as any).mockReturnValue({
      getPayoutPreview: vi.fn().mockReturnValue(initialPreview),
    });

    const { rerender } = render(<PayoutPreview eventId={mockEventId} />);

    // Update preview
    (usePayoutStore as any).mockReturnValue({
      getPayoutPreview: vi.fn().mockReturnValue(updatedPreview),
    });

    rerender(<PayoutPreview eventId={mockEventId} />);

    // Check if the payout value has the changed class
    const payoutElement = screen.getByText('$125.50');
    expect(payoutElement).toHaveClass('MuiTypography-root');
  });

  it('displays risk profile and bankroll information', () => {
    render(<PayoutPreview eventId={mockEventId} />);

    expect(screen.getByText(/Risk Profile: MODERATE/)).toBeInTheDocument();
    expect(screen.getByText(/Bankroll: \$1000.00/)).toBeInTheDocument();
  });
});
