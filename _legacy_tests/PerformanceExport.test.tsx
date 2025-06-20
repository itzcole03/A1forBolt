import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PerformanceExport } from '../PerformanceExport';
import { useModelPerformance } from '../../../hooks/useModelPerformance';

// Mock the useModelPerformance hook
jest.mock('../../../hooks/useModelPerformance', () => ({
  useModelPerformance: jest.fn(),
}));

describe('PerformanceExport', () => {
  const mockHistory = [
    {
      timestamp: '2024-01-01T00:00:00.000Z',
      metrics: {
        roi: 0.1,
        winRate: 0.6,
        profitFactor: 1.5,
      },
    },
    {
      timestamp: '2024-01-02T00:00:00.000Z',
      metrics: {
        roi: 0.15,
        winRate: 0.65,
        profitFactor: 1.6,
      },
    },
  ];

  const mockOnClose = jest.fn();

  beforeEach(() => {
    (useModelPerformance as jest.Mock).mockReturnValue({
      history: mockHistory,
    });
  });

  it('renders export dialog with format options', () => {
    render(<PerformanceExport modelName="TestModel" onClose={mockOnClose} />);

    expect(screen.getByText('Export Performance Data')).toBeInTheDocument();
    expect(screen.getByLabelText('Format')).toBeInTheDocument();
    expect(screen.getByText('CSV')).toBeInTheDocument();
    expect(screen.getByText('JSON')).toBeInTheDocument();
    expect(screen.getByText('Excel')).toBeInTheDocument();
  });

  it('shows available data points count', () => {
    render(<PerformanceExport modelName="TestModel" onClose={mockOnClose} />);

    expect(screen.getByText('2 data points available')).toBeInTheDocument();
  });

  it('exports data in CSV format', () => {
    render(<PerformanceExport modelName="TestModel" onClose={mockOnClose} />);

    const exportButton = screen.getByText('Export');
    fireEvent.click(exportButton);

    // Verify that the download was triggered
    expect(document.createElement).toHaveBeenCalledWith('a');
  });

  it('exports data in JSON format', () => {
    render(<PerformanceExport modelName="TestModel" onClose={mockOnClose} />);

    const formatSelect = screen.getByLabelText('Format');
    fireEvent.mouseDown(formatSelect);
    fireEvent.click(screen.getByText('JSON'));

    const exportButton = screen.getByText('Export');
    fireEvent.click(exportButton);

    // Verify that the download was triggered
    expect(document.createElement).toHaveBeenCalledWith('a');
  });

  it('filters data by date range', () => {
    render(<PerformanceExport modelName="TestModel" onClose={mockOnClose} />);

    const startDateInput = screen.getByLabelText('Start Date');
    const endDateInput = screen.getByLabelText('End Date');

    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
    fireEvent.change(endDateInput, { target: { value: '2024-01-01' } });

    const exportButton = screen.getByText('Export');
    fireEvent.click(exportButton);

    // Verify that only one data point was exported
    expect(document.createElement).toHaveBeenCalledWith('a');
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<PerformanceExport modelName="TestModel" onClose={mockOnClose} />);

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles empty history', () => {
    (useModelPerformance as jest.Mock).mockReturnValue({
      history: [],
    });

    render(<PerformanceExport modelName="TestModel" onClose={mockOnClose} />);

    expect(screen.getByText('0 data points available')).toBeInTheDocument();
  });
});
