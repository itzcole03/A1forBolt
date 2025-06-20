import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RiskProfileManager } from '../RiskProfileManager';
import { useRiskProfileStore } from '../../stores/riskProfileStore';

// Mock the Risk Profile store
vi.mock('../../stores/riskProfileStore', () => ({
  useRiskProfileStore: vi.fn(),
}));

describe('RiskProfileManager', () => {
  const mockRiskProfile = {
    currentProfile: {
      profile_type: 'MODERATE',
      max_stake_percentage: 0.05,
      max_daily_loss: 100,
    },
    bankroll: 1000,
    updateRiskProfile: vi.fn(),
  };

  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();

    // Mock Risk Profile store
    (useRiskProfileStore as any).mockReturnValue(mockRiskProfile);
  });

  it('renders current risk profile', () => {
    render(<RiskProfileManager />);

    expect(screen.getByText('Risk Profile')).toBeInTheDocument();
    expect(screen.getByText('MODERATE')).toBeInTheDocument();
    expect(screen.getByText('Bankroll: $1000.00')).toBeInTheDocument();
  });

  it('allows changing risk profile type', () => {
    render(<RiskProfileManager />);

    // Open profile type select
    const select = screen.getByRole('button', { name: /risk profile/i });
    fireEvent.mouseDown(select);

    // Select new profile type
    const option = screen.getByText('AGGRESSIVE');
    fireEvent.click(option);

    expect(mockRiskProfile.updateRiskProfile).toHaveBeenCalledWith({
      profile_type: 'AGGRESSIVE',
    });
  });

  it('updates bankroll when changed', () => {
    render(<RiskProfileManager />);

    const bankrollInput = screen.getByLabelText(/bankroll/i);
    fireEvent.change(bankrollInput, { target: { value: '2000' } });
    fireEvent.blur(bankrollInput);

    expect(mockRiskProfile.updateRiskProfile).toHaveBeenCalledWith({
      bankroll: 2000,
    });
  });

  it('validates bankroll input', () => {
    render(<RiskProfileManager />);

    const bankrollInput = screen.getByLabelText(/bankroll/i);

    // Try negative value
    fireEvent.change(bankrollInput, { target: { value: '-100' } });
    fireEvent.blur(bankrollInput);
    expect(screen.getByText('Bankroll must be positive')).toBeInTheDocument();

    // Try invalid value
    fireEvent.change(bankrollInput, { target: { value: 'invalid' } });
    fireEvent.blur(bankrollInput);
    expect(screen.getByText('Please enter a valid number')).toBeInTheDocument();
  });

  it('updates max stake percentage when changed', () => {
    render(<RiskProfileManager />);

    const stakeInput = screen.getByLabelText(/max stake percentage/i);
    fireEvent.change(stakeInput, { target: { value: '0.1' } });
    fireEvent.blur(stakeInput);

    expect(mockRiskProfile.updateRiskProfile).toHaveBeenCalledWith({
      max_stake_percentage: 0.1,
    });
  });

  it('validates max stake percentage input', () => {
    render(<RiskProfileManager />);

    const stakeInput = screen.getByLabelText(/max stake percentage/i);

    // Try value > 1
    fireEvent.change(stakeInput, { target: { value: '1.5' } });
    fireEvent.blur(stakeInput);
    expect(screen.getByText('Percentage must be between 0 and 1')).toBeInTheDocument();

    // Try negative value
    fireEvent.change(stakeInput, { target: { value: '-0.1' } });
    fireEvent.blur(stakeInput);
    expect(screen.getByText('Percentage must be between 0 and 1')).toBeInTheDocument();
  });

  it('updates max daily loss when changed', () => {
    render(<RiskProfileManager />);

    const lossInput = screen.getByLabelText(/max daily loss/i);
    fireEvent.change(lossInput, { target: { value: '200' } });
    fireEvent.blur(lossInput);

    expect(mockRiskProfile.updateRiskProfile).toHaveBeenCalledWith({
      max_daily_loss: 200,
    });
  });

  it('validates max daily loss input', () => {
    render(<RiskProfileManager />);

    const lossInput = screen.getByLabelText(/max daily loss/i);

    // Try negative value
    fireEvent.change(lossInput, { target: { value: '-50' } });
    fireEvent.blur(lossInput);
    expect(screen.getByText('Daily loss limit must be positive')).toBeInTheDocument();

    // Try invalid value
    fireEvent.change(lossInput, { target: { value: 'invalid' } });
    fireEvent.blur(lossInput);
    expect(screen.getByText('Please enter a valid number')).toBeInTheDocument();
  });

  it('shows animation when values change', () => {
    const { rerender } = render(<RiskProfileManager />);

    // Update bankroll
    (useRiskProfileStore as any).mockReturnValue({
      ...mockRiskProfile,
      bankroll: 2000,
    });

    rerender(<RiskProfileManager />);

    const bankrollElement = screen.getByText('$2000.00');
    expect(bankrollElement).toHaveClass('MuiTypography-root');
  });
});
