import { renderHook, act } from '@testing-library/react-hooks';
import { useModelPerformance } from '../useModelPerformance';
import { ModelPerformanceService } from '../../services/analytics/modelPerformanceService';

// Mock the ModelPerformanceService
jest.mock('../../services/analytics/modelPerformanceService');

describe('useModelPerformance', () => {
  const mockPerformance = {
    totalPredictions: 100,
    correctPredictions: 60,
    totalStake: 1000,
    totalPayout: 1200,
    roi: 0.2,
    winRate: 0.6,
    averageConfidence: 0.75,
    averageOdds: 2.0,
    profitFactor: 1.5,
    sharpeRatio: 1.2,
    maxDrawdown: 0.15,
    lastUpdated: new Date(),
  };

  const mockHistory = [
    {
      timestamp: new Date(),
      metrics: mockPerformance,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (ModelPerformanceService.getInstance as jest.Mock).mockReturnValue({
      getModelPerformance: jest.fn().mockResolvedValue({
        performance: mockPerformance,
        history: mockHistory,
      }),
    });
  });

  it('should fetch performance data on mount', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useModelPerformance('test-model'));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();

    await waitForNextUpdate();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.performance).toEqual(mockPerformance);
    expect(result.current.history).toEqual(mockHistory);
    expect(result.current.error).toBeNull();
  });

  it('should handle errors when fetching data', async () => {
    const error = new Error('API Error');
    (ModelPerformanceService.getInstance as jest.Mock).mockReturnValue({
      getModelPerformance: jest.fn().mockRejectedValue(error),
    });

    const { result, waitForNextUpdate } = renderHook(() => useModelPerformance('test-model'));

    await waitForNextUpdate();

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('API Error');
    expect(result.current.performance).toBeUndefined();
    expect(result.current.history).toEqual([]);
  });

  it('should update timeframe and refetch data', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useModelPerformance('test-model'));

    await waitForNextUpdate();

    act(() => {
      result.current.setTimeframe('month');
    });

    expect(result.current.timeframe).toBe('month');
    expect(result.current.isLoading).toBe(true);

    await waitForNextUpdate();

    expect(result.current.isLoading).toBe(false);
    expect(ModelPerformanceService.getInstance().getModelPerformance).toHaveBeenCalledWith(
      'test-model',
      'month'
    );
  });

  it('should refresh data when refresh is called', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useModelPerformance('test-model'));

    await waitForNextUpdate();

    act(() => {
      result.current.refresh();
    });

    expect(result.current.isLoading).toBe(true);

    await waitForNextUpdate();

    expect(result.current.isLoading).toBe(false);
    expect(ModelPerformanceService.getInstance().getModelPerformance).toHaveBeenCalledTimes(2);
  });

  it('should use default timeframe if not specified', () => {
    const { result } = renderHook(() => useModelPerformance('test-model'));
    expect(result.current.timeframe).toBe('week');
  });

  it('should use custom initial timeframe if specified', () => {
    const { result } = renderHook(() => useModelPerformance('test-model', 'day'));
    expect(result.current.timeframe).toBe('day');
  });
});
