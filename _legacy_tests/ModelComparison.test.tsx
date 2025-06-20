import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ModelComparison } from '../ModelComparison';
import { useModelPerformance } from '../../../hooks/useModelPerformance';

// Mock the useModelPerformance hook
jest.mock('../../../hooks/useModelPerformance');

const mockPerformance = {
  roi: 0.15,
  winRate: 0.65,
  profitFactor: 1.8,
  sharpeRatio: 2.1,
  maxDrawdown: 0.12,
  kellyCriterion: 0.08,
  expectedValue: 25.5,
  calibrationScore: 0.85,
};

describe('ModelComparison', () => {
  const modelNames = ['Model A', 'Model B', 'Model C'];

  beforeEach(() => {
    (useModelPerformance as jest.Mock).mockReturnValue({
      performance: mockPerformance,
      isLoading: false,
      error: null,
    });
  });

  it('renders comparison table with all models', () => {
    render(<ModelComparison modelNames={modelNames} />);

    expect(screen.getByText('Model Comparison')).toBeInTheDocument();
    modelNames.forEach(modelName => {
      expect(screen.getByText(modelName)).toBeInTheDocument();
    });
  });

  it('displays all metrics for each model', () => {
    render(<ModelComparison modelNames={modelNames} />);

    expect(screen.getByText('ROI')).toBeInTheDocument();
    expect(screen.getByText('Win Rate')).toBeInTheDocument();
    expect(screen.getByText('Profit Factor')).toBeInTheDocument();
    expect(screen.getByText('Sharpe Ratio')).toBeInTheDocument();
    expect(screen.getByText('Max Drawdown')).toBeInTheDocument();
    expect(screen.getByText('Kelly Criterion')).toBeInTheDocument();
    expect(screen.getByText('Expected Value')).toBeInTheDocument();
    expect(screen.getByText('Calibration Score')).toBeInTheDocument();
  });

  it('handles loading state', () => {
    (useModelPerformance as jest.Mock).mockReturnValue({
      performance: null,
      isLoading: true,
      error: null,
    });

    render(<ModelComparison modelNames={modelNames} />);

    expect(screen.getAllByText('Loading...')).toHaveLength(modelNames.length * 8); // 8 metrics per model
  });

  it('handles error state', () => {
    (useModelPerformance as jest.Mock).mockReturnValue({
      performance: null,
      isLoading: false,
      error: 'Test error',
    });

    render(<ModelComparison modelNames={modelNames} />);

    expect(screen.getAllByText('Error')).toHaveLength(modelNames.length * 8); // 8 metrics per model
  });

  it('changes selected metric when metric selector is used', () => {
    render(<ModelComparison modelNames={modelNames} />);

    const metricSelect = screen.getByLabelText('Metric');
    fireEvent.mouseDown(metricSelect);
    fireEvent.click(screen.getByText('Win Rate'));

    const selectedCell = screen.getByText('Win Rate').closest('th');
    expect(selectedCell).toHaveStyle({
      backgroundColor: expect.stringContaining('action.selected'),
    });
  });

  it('changes timeframe when timeframe selector is used', () => {
    render(<ModelComparison modelNames={modelNames} />);

    const timeframeSelect = screen.getByLabelText('Timeframe');
    fireEvent.mouseDown(timeframeSelect);
    fireEvent.click(screen.getByText('Last Month'));

    expect(useModelPerformance).toHaveBeenCalledWith(expect.any(String), 'month');
  });

  it('formats metrics correctly', () => {
    render(<ModelComparison modelNames={modelNames} />);

    expect(screen.getAllByText('15.0%')).toHaveLength(modelNames.length); // ROI
    expect(screen.getAllByText('65.0%')).toHaveLength(modelNames.length); // Win Rate
    expect(screen.getAllByText('1.80')).toHaveLength(modelNames.length); // Profit Factor
    expect(screen.getAllByText('$25.50')).toHaveLength(modelNames.length); // Expected Value
  });

  it('applies correct colors to metrics', () => {
    render(<ModelComparison modelNames={modelNames} />);

    const roiCells = screen.getAllByText('15.0%');
    roiCells.forEach(cell => {
      expect(cell).toHaveStyle({ color: expect.stringContaining('success') });
    });

    const maxDrawdownCells = screen.getAllByText('12.0%');
    maxDrawdownCells.forEach(cell => {
      expect(cell).toHaveStyle({ color: expect.stringContaining('warning') });
    });
  });

  it('switches between table and radar views', () => {
    render(<ModelComparison modelNames={modelNames} />);

    // Initially in table view
    expect(screen.getByRole('table')).toBeInTheDocument();

    // Switch to radar view
    const radarButton = screen.getByRole('button', { name: 'Radar' });
    fireEvent.click(radarButton);

    // Check for radar chart elements
    expect(screen.getByRole('img')).toBeInTheDocument(); // Radar chart is rendered as an image
  });

  it('displays radar chart with correct data', () => {
    render(<ModelComparison modelNames={modelNames} />);

    // Switch to radar view
    const radarButton = screen.getByRole('button', { name: 'Radar' });
    fireEvent.click(radarButton);

    // Check for model names in the radar chart
    modelNames.forEach(modelName => {
      expect(screen.getByText(modelName)).toBeInTheDocument();
    });
  });

  it('switches to bar chart view', () => {
    render(<ModelComparison modelNames={modelNames} />);

    // Switch to bar view
    const barButton = screen.getByRole('button', { name: 'Bar' });
    fireEvent.click(barButton);

    // Check for bar chart elements
    expect(screen.getByRole('img')).toBeInTheDocument(); // Bar chart is rendered as an image
  });

  it('updates bar chart when metric is changed', () => {
    render(<ModelComparison modelNames={modelNames} />);

    // Switch to bar view
    const barButton = screen.getByRole('button', { name: 'Bar' });
    fireEvent.click(barButton);

    // Change metric
    const metricSelect = screen.getByLabelText('Metric');
    fireEvent.mouseDown(metricSelect);
    fireEvent.click(screen.getByText('Win Rate'));

    // Check that the chart updates with the new metric
    expect(screen.getByText('Win Rate')).toBeInTheDocument();
  });

  it('displays correct values in bar chart', () => {
    render(<ModelComparison modelNames={modelNames} />);

    // Switch to bar view
    const barButton = screen.getByRole('button', { name: 'Bar' });
    fireEvent.click(barButton);

    // Check for formatted values
    expect(screen.getAllByText('15.0%')).toHaveLength(modelNames.length); // ROI by default
  });
});
