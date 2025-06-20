import { renderHook } from '@testing-library/react';
import { useFilteredPredictions } from '../useFilteredPredictions';
import { useFilterStore } from '../../stores/filterStore';
import { useStrategyInput } from '../../contexts/StrategyInputContext';
import { useBettingAnalytics } from '../useBettingAnalytics';

// Mock the hooks
jest.mock('../../stores/filterStore', () => ({
  useFilterStore: jest.fn(),
}));

jest.mock('../../contexts/StrategyInputContext', () => ({
  useStrategyInput: jest.fn(),
}));

jest.mock('../useBettingAnalytics', () => ({
  useBettingAnalytics: jest.fn(),
}));

describe('useFilteredPredictions', () => {
  const mockPredictions = [
    {
      id: '1',
      sport: 'NBA',
      propType: 'POINTS',
      confidence: 0.75,
      odds: 2.5,
      value: 25,
    },
    {
      id: '2',
      sport: 'NFL',
      propType: 'TOUCHDOWNS',
      confidence: 0.45,
      odds: 6.0,
      value: 2,
    },
  ];

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock useFilterStore
    (useFilterStore as unknown as jest.Mock).mockReturnValue({
      activeFilters: new Set(['NBA', 'POINTS', 'confidence_high']),
    });

    // Mock useStrategyInput
    (useStrategyInput as jest.Mock).mockReturnValue({
      strategyInput: {
        selectedSports: [],
        selectedPropTypes: [],
        minConfidence: 0.55,
        minPayout: 1.5,
        maxPayout: 5,
      },
    });

    // Mock useBettingAnalytics
    (useBettingAnalytics as jest.Mock).mockReturnValue({
      predictions: mockPredictions,
      isLoading: false,
      error: null,
    });
  });

  it('should filter predictions based on active filters', () => {
    const { result } = renderHook(() => useFilteredPredictions());

    expect(result.current.predictions).toHaveLength(1);
    expect(result.current.predictions[0].id).toBe('1');
  });

  it('should filter predictions based on strategy input', () => {
    (useStrategyInput as jest.Mock).mockReturnValue({
      strategyInput: {
        selectedSports: ['NBA'],
        selectedPropTypes: ['POINTS'],
        minConfidence: 0.7,
        minPayout: 2,
        maxPayout: 3,
      },
    });

    const { result } = renderHook(() => useFilteredPredictions());

    expect(result.current.predictions).toHaveLength(1);
    expect(result.current.predictions[0].id).toBe('1');
  });

  it('should handle loading state', () => {
    (useBettingAnalytics as jest.Mock).mockReturnValue({
      predictions: null,
      isLoading: true,
      error: null,
    });

    const { result } = renderHook(() => useFilteredPredictions());

    expect(result.current.loading).toBe(true);
    expect(result.current.predictions).toHaveLength(0);
  });

  it('should handle error state', () => {
    const error = new Error('Failed to fetch predictions');
    (useBettingAnalytics as jest.Mock).mockReturnValue({
      predictions: null,
      isLoading: false,
      error,
    });

    const { result } = renderHook(() => useFilteredPredictions());

    expect(result.current.error).toBe(error);
    expect(result.current.predictions).toHaveLength(0);
  });

  it('should return correct counts', () => {
    const { result } = renderHook(() => useFilteredPredictions());

    expect(result.current.totalPredictions).toBe(2);
    expect(result.current.filteredCount).toBe(1);
  });

  it('should handle no results', () => {
    (useFilterStore as unknown as jest.Mock).mockReturnValue({
      activeFilters: new Set(['INVALID_SPORT']),
    });

    const { result } = renderHook(() => useFilteredPredictions());

    expect(result.current.hasResults).toBe(false);
    expect(result.current.predictions).toHaveLength(0);
  });
});
