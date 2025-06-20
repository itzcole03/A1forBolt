import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BettingSettingsPanel } from '../BettingSettingsPanel';
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

const mockHandlers = {
  handleRiskProfileChange: jest.fn(),
  handleStakeChange: jest.fn(),
  handleModelChange: jest.fn(),
  resetSettings: jest.fn(),
};

describe('BettingSettingsPanel', () => {
  beforeEach(() => {
    (useBettingSettings as jest.Mock).mockReturnValue({
      settings: mockSettings,
      isLoading: false,
      error: null,
      ...mockHandlers,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state', () => {
    (useBettingSettings as jest.Mock).mockReturnValue({
      settings: mockSettings,
      isLoading: true,
      error: null,
      ...mockHandlers,
    });

    render(<BettingSettingsPanel />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders error state', () => {
    (useBettingSettings as jest.Mock).mockReturnValue({
      settings: mockSettings,
      isLoading: false,
      error: 'Failed to load settings',
      ...mockHandlers,
    });

    render(<BettingSettingsPanel />);
    expect(screen.getByText('Failed to load settings')).toBeInTheDocument();
  });

  it('renders settings panel with all controls', () => {
    render(<BettingSettingsPanel />);

    // Check for main sections
    expect(screen.getByText('Betting Settings')).toBeInTheDocument();
    expect(screen.getByText('Risk Profile')).toBeInTheDocument();
    expect(screen.getByText('Stake Size')).toBeInTheDocument();
    expect(screen.getByText('Prediction Model')).toBeInTheDocument();

    // Check for reset button
    expect(screen.getByText('Reset to Default')).toBeInTheDocument();
  });

  it('handles risk profile change', () => {
    render(<BettingSettingsPanel />);

    const conservativeRadio = screen.getByLabelText(/conservative/i);
    fireEvent.click(conservativeRadio);

    expect(mockHandlers.handleRiskProfileChange).toHaveBeenCalledWith('conservative');
  });

  it('handles stake size change', () => {
    render(<BettingSettingsPanel />);

    const stakeInput = screen.getByRole('slider');
    fireEvent.change(stakeInput, { target: { value: 200 } });

    expect(mockHandlers.handleStakeChange).toHaveBeenCalledWith(200);
  });

  it('handles model change', () => {
    render(<BettingSettingsPanel />);

    const modelSelect = screen.getByLabelText(/select model/i);
    fireEvent.change(modelSelect, { target: { value: 'model-2' } });

    expect(mockHandlers.handleModelChange).toHaveBeenCalledWith('model-2');
  });

  it('handles reset settings', () => {
    render(<BettingSettingsPanel />);

    const resetButton = screen.getByText('Reset to Default');
    fireEvent.click(resetButton);

    expect(mockHandlers.resetSettings).toHaveBeenCalled();
  });
});
