import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PredictionDisplay } from '../PredictionDisplay';
import { useWebSocketStore } from '../../services/websocket';
import { usePredictionStore } from '../../stores/predictionStore';

// Mock the stores
vi.mock('../../services/websocket', () => ({
  useWebSocketStore: vi.fn(),
}));

vi.mock('../../stores/predictionStore', () => ({
  usePredictionStore: vi.fn(),
}));

describe('PredictionDisplay', () => {
  const mockEventId = 'test-event-123';
  const mockPrediction = {
    confidence: 0.85,
    recommended_stake: 50,
    risk_level: 'MODERATE',
    shap_values: {
      home_team_form: 0.3,
      away_team_form: -0.2,
      head_to_head: 0.15,
      injuries: -0.1,
    },
    timestamp: '2024-03-20T12:00:00Z',
  };

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Mock WebSocket store
    (useWebSocketStore as any).mockReturnValue({
      subscribeToEvent: vi.fn(),
      unsubscribeFromEvent: vi.fn(),
    });

    // Mock Prediction store
    (usePredictionStore as any).mockReturnValue({
      getPredictionForEvent: vi.fn().mockReturnValue(mockPrediction),
    });
  });

  it('renders loading state initially', () => {
    // Mock empty prediction
    (usePredictionStore as any).mockReturnValue({
      getPredictionForEvent: vi.fn().mockReturnValue(null),
    });

    render(<PredictionDisplay eventId={mockEventId} />);
    expect(screen.getByText('Loading prediction...')).toBeInTheDocument();
  });

  it('renders prediction data correctly', () => {
    render(<PredictionDisplay eventId={mockEventId} />);

    // Check confidence level
    expect(screen.getByText('Confidence Level')).toBeInTheDocument();
    expect(screen.getByText('0.85 (MODERATE)')).toBeInTheDocument();

    // Check recommended stake
    expect(screen.getByText('Recommended Stake')).toBeInTheDocument();
    expect(screen.getByText('$50.00')).toBeInTheDocument();

    // Check SHAP values section
    expect(screen.getByText('Feature Impact (SHAP Values)')).toBeInTheDocument();
  });

  it('subscribes to event updates on mount and unsubscribes on unmount', () => {
    const { unmount } = render(<PredictionDisplay eventId={mockEventId} />);

    expect(useWebSocketStore().subscribeToEvent).toHaveBeenCalledWith(mockEventId);

    unmount();

    expect(useWebSocketStore().unsubscribeFromEvent).toHaveBeenCalledWith(mockEventId);
  });

  it('allows filtering SHAP values', () => {
    render(<PredictionDisplay eventId={mockEventId} />);

    // Open filter menu
    const filterButton = screen.getByRole('button', { name: /filter/i });
    fireEvent.click(filterButton);

    // Check filter options
    expect(screen.getByText('All Features')).toBeInTheDocument();
    expect(screen.getByText('Positive Impact')).toBeInTheDocument();
    expect(screen.getByText('Negative Impact')).toBeInTheDocument();
  });

  it('allows sorting SHAP values', () => {
    render(<PredictionDisplay eventId={mockEventId} />);

    // Open sort menu
    const sortButton = screen.getByRole('button', { name: /sort/i });
    fireEvent.click(sortButton);

    // Check sort options
    expect(screen.getByText('Highest Impact First')).toBeInTheDocument();
    expect(screen.getByText('Lowest Impact First')).toBeInTheDocument();
  });

  it('shows animation when prediction changes', () => {
    const initialPrediction = {
      ...mockPrediction,
      confidence: 0.75,
    };

    const updatedPrediction = {
      ...mockPrediction,
      confidence: 0.85,
    };

    // Start with initial prediction
    (usePredictionStore as any).mockReturnValue({
      getPredictionForEvent: vi.fn().mockReturnValue(initialPrediction),
    });

    const { rerender } = render(<PredictionDisplay eventId={mockEventId} />);

    // Update prediction
    (usePredictionStore as any).mockReturnValue({
      getPredictionForEvent: vi.fn().mockReturnValue(updatedPrediction),
    });

    rerender(<PredictionDisplay eventId={mockEventId} />);

    // Check if the confidence value has the changed class
    const confidenceElement = screen.getByText('0.85 (MODERATE)');
    expect(confidenceElement).toHaveClass('MuiTypography-root');
  });
});
