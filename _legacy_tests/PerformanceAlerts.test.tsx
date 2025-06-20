import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PerformanceAlerts } from '../PerformanceAlerts';
import { PerformanceMonitor } from '../../../core/analytics/PerformanceMonitor';
import { LoggerProvider } from '../../../contexts/LoggerContext';
import { MetricsProvider } from '../../../contexts/MetricsContext';

// Mock the PerformanceMonitor
jest.mock('../../../core/analytics/PerformanceMonitor', () => ({
  PerformanceMonitor: {
    getInstance: jest.fn(),
  },
}));

// Mock the hooks
jest.mock('../../../hooks/useLogger', () => ({
  useLogger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
  }),
}));

jest.mock('../../../hooks/useMetrics', () => ({
  useMetrics: () => ({
    track: jest.fn(),
    increment: jest.fn(),
    gauge: jest.fn(),
    timing: jest.fn(),
    histogram: jest.fn(),
  }),
}));

describe('PerformanceAlerts', () => {
  const mockAlerts = [
    {
      modelName: 'TestModel',
      metric: 'roi',
      value: -0.15,
      threshold: -0.1,
      severity: 'warning',
      timestamp: new Date().toISOString(),
    },
    {
      modelName: 'TestModel',
      metric: 'winRate',
      value: 0.25,
      threshold: 0.3,
      severity: 'critical',
      timestamp: new Date().toISOString(),
    },
  ];

  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
  };

  const mockMetrics = {
    track: jest.fn(),
    increment: jest.fn(),
    gauge: jest.fn(),
    timing: jest.fn(),
    histogram: jest.fn(),
  };

  beforeEach(() => {
    const mockMonitor = {
      getAlerts: jest.fn().mockReturnValue(mockAlerts),
      clearAlerts: jest.fn(),
    };
    (PerformanceMonitor.getInstance as jest.Mock).mockReturnValue(mockMonitor);
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <LoggerProvider logger={mockLogger}>
        <MetricsProvider metrics={mockMetrics}>{ui}</MetricsProvider>
      </LoggerProvider>
    );
  };

  it('renders alerts correctly', () => {
    renderWithProviders(<PerformanceAlerts modelName="TestModel" />);

    expect(screen.getByText('Performance Alerts')).toBeInTheDocument();
    expect(screen.getByText('TestModel - roi')).toBeInTheDocument();
    expect(screen.getByText('TestModel - winRate')).toBeInTheDocument();
  });

  it('filters alerts by severity', async () => {
    renderWithProviders(<PerformanceAlerts modelName="TestModel" />);

    const severitySelect = screen.getByLabelText('Severity');
    fireEvent.mouseDown(severitySelect);
    fireEvent.click(screen.getByText('Critical'));

    await waitFor(() => {
      expect(screen.queryByText('TestModel - roi')).not.toBeInTheDocument();
      expect(screen.getByText('TestModel - winRate')).toBeInTheDocument();
    });
  });

  it('filters alerts by timeframe', async () => {
    renderWithProviders(<PerformanceAlerts modelName="TestModel" />);

    const timeframeSelect = screen.getByLabelText('Timeframe');
    fireEvent.mouseDown(timeframeSelect);
    fireEvent.click(screen.getByText('Last Week'));

    await waitFor(() => {
      const mockMonitor = PerformanceMonitor.getInstance(mockLogger, mockMetrics);
      expect(mockMonitor.getAlerts).toHaveBeenCalledWith('TestModel', undefined, expect.any(Date));
    });
  });

  it('clears alerts when clear button is clicked', () => {
    renderWithProviders(<PerformanceAlerts modelName="TestModel" />);

    const clearButton = screen.getByRole('button', { name: /clear/i });
    fireEvent.click(clearButton);

    const mockMonitor = PerformanceMonitor.getInstance(mockLogger, mockMetrics);
    expect(mockMonitor.clearAlerts).toHaveBeenCalledWith('TestModel');
  });

  it('displays no alerts message when there are no alerts', () => {
    const mockMonitor = {
      getAlerts: jest.fn().mockReturnValue([]),
      clearAlerts: jest.fn(),
    };
    (PerformanceMonitor.getInstance as jest.Mock).mockReturnValue(mockMonitor);

    renderWithProviders(<PerformanceAlerts modelName="TestModel" />);

    expect(screen.getByText('No alerts in the selected timeframe.')).toBeInTheDocument();
  });

  it('calls onAlertClick when an alert is clicked', () => {
    const onAlertClick = jest.fn();
    renderWithProviders(<PerformanceAlerts modelName="TestModel" onAlertClick={onAlertClick} />);

    const alert = screen.getByText('TestModel - roi').closest('div');
    fireEvent.click(alert!);

    expect(onAlertClick).toHaveBeenCalledWith(mockAlerts[0]);
  });

  it('formats metric values correctly', () => {
    renderWithProviders(<PerformanceAlerts modelName="TestModel" />);

    expect(screen.getByText('Current value: -15.0%')).toBeInTheDocument();
    expect(screen.getByText('Threshold: -10.0%')).toBeInTheDocument();
  });
});
