import { render, screen } from '@testing-library/react';
import { BankrollTracker } from '../BankrollTracker';
import * as bankrollStore from '../../../store/slices/bankrollSlice';

describe('BankrollTracker', () => {
  beforeEach(() => {
    jest.spyOn(bankrollStore, 'useBankrollStore').mockImplementation((selector) =>
      selector({
        stats: {
          currentBalance: 1200,
          startingBalance: 1000,
          totalWins: 5,
          totalLosses: 3,
          winRate: 0.625,
          averageBetSize: 50,
          largestWin: 200,
          largestLoss: 100,
          netProfit: 200,
          roi: 0.2,
        },
        refreshStats: jest.fn(),
      })
    );
  });
  afterEach(() => {
    jest.restoreAllMocks();
  });
  it('renders bankroll stats', () => {
    render(<BankrollTracker />);
    expect(screen.getByText('Current Balance: $1200.00')).toBeInTheDocument();
    expect(screen.getByText('Net Profit:')).toBeInTheDocument();
    expect(screen.getByText('ROI: 20.00%')).toBeInTheDocument();
    expect(screen.getByText('Win Rate: 62.5%')).toBeInTheDocument();
    expect(screen.getByText('Largest Win: $200.00')).toBeInTheDocument();
    expect(screen.getByText('Largest Loss: $100.00')).toBeInTheDocument();
  });
});
