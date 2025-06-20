import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModelPerformanceDashboard } from '../ModelPerformanceDashboard';
import { useModelPerformance } from '../../../hooks/useModelPerformance';
import { PerformanceExport } from '../PerformanceExport';
import { ModelComparison } from '../ModelComparison';

// Mock the hooks and components
jest.mock('../../../hooks/useModelPerformance');
jest.mock('../PerformanceExport', () => ({
  PerformanceExport: jest.fn(({ onClose }) => (
    <div data-testid="performance-export">
      <button onClick={onClose}>Close Export</button>
    </div>
  )),
}));
jest.mock('../ModelComparison', () => ({
  ModelComparison: jest.fn(({ modelNames }) => (
    <div data-testid="model-comparison">
      <div>Model Comparison</div>
      {modelNames.map((name: string) => (
        <div key={name}>{name}</div>
      ))}
    </div>
  )),
}));

const mockPerformance = {
  roi: 0.15,
  winRate: 0.65,
  profitFactor: 1.8,
  sharpeRatio: 2.1,
  maxDrawdown: 0.12,
  kellyCriterion: 0.08,
  expectedValue: 25.5,
  calibrationScore: 0.85,
  totalPredictions: 100,
  totalStake: 1000,
  totalPayout: 1150,
};

const mockHistory = [
  {
    timestamp: '2024-01-01T00:00:00Z',
    metrics: {
      roi: 0.1,
      winRate: 0.6,
      profitFactor: 1.5,
      calibrationScore: 0.8,
    },
  },
  {
    timestamp: '2024-01-02T00:00:00Z',
    metrics: {
      roi: 0.15,
      winRate: 0.65,
      profitFactor: 1.8,
      calibrationScore: 0.85,
    },
  },
];

describe('ModelPerformanceDashboard', () => {
  beforeEach(() => {
    (useModelPerformance as jest.Mock).mockReturnValue({
      performance: mockPerformance,
      history: mockHistory,
      isLoading: false,
      error: null,
      timeframe: 'week',
      setTimeframe: jest.fn(),
    });
  });

  it('renders loading state', () => {
    (useModelPerformance as jest.Mock).mockReturnValue({
      isLoading: true,
      error: null,
    });

    render(<ModelPerformanceDashboard modelName="test-model" />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders error state', () => {
    (useModelPerformance as jest.Mock).mockReturnValue({
      isLoading: false,
      error: 'Test error',
    });

    render(<ModelPerformanceDashboard modelName="test-model" />);
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('renders no data state', () => {
    (useModelPerformance as jest.Mock).mockReturnValue({
      isLoading: false,
      error: null,
      performance: null,
    });

    render(<ModelPerformanceDashboard modelName="test-model" />);
    expect(screen.getByText(/No performance data available/)).toBeInTheDocument();
  });

  it('renders performance metrics', () => {
    render(<ModelPerformanceDashboard modelName="test-model" />);

    expect(screen.getByText('ROI')).toBeInTheDocument();
    expect(screen.getByText('15.0%')).toBeInTheDocument();
    expect(screen.getByText('Win Rate')).toBeInTheDocument();
    expect(screen.getByText('65.0%')).toBeInTheDocument();
    expect(screen.getByText('Profit Factor')).toBeInTheDocument();
    expect(screen.getByText('1.80')).toBeInTheDocument();
  });

  it('handles timeframe changes', () => {
    const setTimeframe = jest.fn();
    (useModelPerformance as jest.Mock).mockReturnValue({
      performance: mockPerformance,
      history: mockHistory,
      isLoading: false,
      error: null,
      timeframe: 'week',
      setTimeframe,
    });

    render(<ModelPerformanceDashboard modelName="test-model" />);

    const select = screen.getByLabelText('Timeframe');
    fireEvent.mouseDown(select);
    fireEvent.click(screen.getByText('Last Month'));

    expect(setTimeframe).toHaveBeenCalledWith('month');
  });

  it('renders performance history chart', () => {
    render(<ModelPerformanceDashboard modelName="test-model" />);

    expect(screen.getByText('Performance History')).toBeInTheDocument();
    expect(screen.getByText('ROI')).toBeInTheDocument();
    expect(screen.getByText('Win Rate')).toBeInTheDocument();
    expect(screen.getByText('Profit Factor')).toBeInTheDocument();
    expect(screen.getByText('Calibration Score')).toBeInTheDocument();
  });

  it('shows export dialog when export button is clicked', () => {
    render(<ModelPerformanceDashboard modelName="test-model" />);

    const exportButton = screen.getByText('Export Data');
    fireEvent.click(exportButton);

    expect(screen.getByTestId('performance-export')).toBeInTheDocument();
  });

  it('closes export dialog when close button is clicked', () => {
    render(<ModelPerformanceDashboard modelName="test-model" />);

    // Open export dialog
    const exportButton = screen.getByText('Export Data');
    fireEvent.click(exportButton);

    // Close export dialog
    const closeButton = screen.getByText('Close Export');
    fireEvent.click(closeButton);

    expect(screen.queryByTestId('performance-export')).not.toBeInTheDocument();
  });

  it('applies correct colors to metrics based on their values', () => {
    render(<ModelPerformanceDashboard modelName="test-model" />);

    // Positive ROI should be green
    const roiElement = screen.getByText('15.0%');
    expect(roiElement).toHaveStyle({ color: expect.stringContaining('success') });

    // High calibration score should be green
    const calibrationElement = screen.getByText('0.85');
    expect(calibrationElement).toHaveStyle({ color: expect.stringContaining('success') });
  });

  it('shows model comparison tab when available models are provided', () => {
    const availableModels = ['model-b', 'model-c'];
    render(<ModelPerformanceDashboard availableModels={availableModels} modelName="test-model" />);

    expect(screen.getByText('Model Comparison')).toBeInTheDocument();
  });

  it('does not show model comparison tab when no available models are provided', () => {
    render(<ModelPerformanceDashboard modelName="test-model" />);

    expect(screen.queryByText('Model Comparison')).not.toBeInTheDocument();
  });

  it('switches to model comparison view when tab is clicked', () => {
    const availableModels = ['model-b', 'model-c'];
    render(<ModelPerformanceDashboard availableModels={availableModels} modelName="test-model" />);

    const comparisonTab = screen.getByText('Model Comparison');
    fireEvent.click(comparisonTab);

    expect(screen.getByTestId('model-comparison')).toBeInTheDocument();
    expect(screen.getByText('test-model')).toBeInTheDocument();
    expect(screen.getByText('model-b')).toBeInTheDocument();
    expect(screen.getByText('model-c')).toBeInTheDocument();
  });
});
