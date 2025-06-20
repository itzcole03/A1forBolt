import React from 'react';
import { render, screen } from '@testing-library/react';
import { BettingSettingsSummary } from '../BettingSettingsSummary';
import { useBettingSettings } from '../../../hooks/useBettingSettings';

// Mock the useBettingSettings hook
jest.mock('../../../hooks/useBettingSettings');

const mockSettings = {
  modelId: 'model-1',
  riskProfile: 'moderate',
  stakeSize: 100,
  maxStake: 1000,
  minStake: 10,
  confidenceThreshold: 0.7,
};

describe('BettingSettingsSummary', () => {
  beforeEach(() => {
    (useBettingSettings as jest.Mock).mockReturnValue({
      settings: mockSettings,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders current settings summary', () => {
    render(<BettingSettingsSummary />);

    // Check for main sections
    expect(screen.getByText('Current Settings')).toBeInTheDocument();
    expect(screen.getByText('Risk Profile')).toBeInTheDocument();
    expect(screen.getByText('Stake Size')).toBeInTheDocument();
    expect(screen.getByText('Confidence Threshold')).toBeInTheDocument();
    expect(screen.getByText('Selected Model')).toBeInTheDocument();
  });

  it('displays risk profile with correct color', () => {
    render(<BettingSettingsSummary />);

    const riskProfileChip = screen.getByText('Moderate');
    expect(riskProfileChip).toHaveClass('MuiChip-colorWarning');
  });

  it('displays stake size and range', () => {
    render(<BettingSettingsSummary />);

    expect(screen.getByText('$100.00')).toBeInTheDocument();
    expect(screen.getByText('Range: $10.00 - $1,000.00')).toBeInTheDocument();
  });

  it('displays confidence threshold with progress bar', () => {
    render(<BettingSettingsSummary />);

    const progressBar = screen.getByRole('progressbar');
    expect(progressBar).toHaveAttribute('aria-valuenow', '70');
    expect(screen.getByText('70%')).toBeInTheDocument();
  });

  it('displays selected model', () => {
    render(<BettingSettingsSummary />);

    expect(screen.getByText('model-1')).toBeInTheDocument();
  });

  it('displays "No model selected" when modelId is empty', () => {
    (useBettingSettings as jest.Mock).mockReturnValue({
      settings: { ...mockSettings, modelId: '' },
    });

    render(<BettingSettingsSummary />);
    expect(screen.getByText('No model selected')).toBeInTheDocument();
  });

  it('displays different risk profile colors', () => {
    const { rerender } = render(<BettingSettingsSummary />);

    // Test conservative profile
    (useBettingSettings as jest.Mock).mockReturnValue({
      settings: { ...mockSettings, riskProfile: 'conservative' },
    });
    rerender(<BettingSettingsSummary />);
    expect(screen.getByText('Conservative')).toHaveClass('MuiChip-colorSuccess');

    // Test aggressive profile
    (useBettingSettings as jest.Mock).mockReturnValue({
      settings: { ...mockSettings, riskProfile: 'aggressive' },
    });
    rerender(<BettingSettingsSummary />);
    expect(screen.getByText('Aggressive')).toHaveClass('MuiChip-colorError');
  });
});
