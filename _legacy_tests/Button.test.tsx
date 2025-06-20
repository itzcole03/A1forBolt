import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button, BettingButton, QuickBetButton, BettingButtonGroup } from '../index';

describe('Button Components', () => {
  describe('Button', () => {
    it('renders with default props', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByText('Click me')).toBeInTheDocument();
    });

    it('handles click events', () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Click me</Button>);
      fireEvent.click(screen.getByText('Click me'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('applies variant styles', () => {
      render(<Button variant="primary">Primary</Button>);
      const button = screen.getByText('Primary');
      expect(button).toHaveClass('bg-blue-600');
    });

    it('shows loading state', () => {
      render(<Button isLoading>Click me</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
      expect(screen.getByRole('button')).toHaveClass('opacity-50');
    });
  });

  describe('BettingButton', () => {
    it('renders with bet details', () => {
      render(
        <BettingButton showDetails odds={2.5} potentialReturn={250} stake={100}>
          Place Bet
        </BettingButton>
      );
      expect(screen.getByText('Place Bet')).toBeInTheDocument();
      expect(screen.getByText('Stake: $100.00')).toBeInTheDocument();
      expect(screen.getByText('Odds: 2.50')).toBeInTheDocument();
      expect(screen.getByText('Return: $250.00')).toBeInTheDocument();
    });

    it('shows placing state', () => {
      render(<BettingButton isPlacing>Place Bet</BettingButton>);
      expect(screen.getByText('Placing Bet...')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('shows confirmed state', () => {
      render(<BettingButton isConfirmed>Place Bet</BettingButton>);
      expect(screen.getByText('Bet Confirmed')).toBeInTheDocument();
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('QuickBetButton', () => {
    it('renders with amount and odds', () => {
      render(<QuickBetButton amount={50} odds={2.0} />);
      expect(screen.getByText('$50')).toBeInTheDocument();
      expect(screen.getByText('Return: $100.00')).toBeInTheDocument();
    });

    it('handles quick bet clicks', () => {
      const handleQuickBet = jest.fn();
      render(<QuickBetButton amount={50} odds={2.0} onQuickBet={handleQuickBet} />);
      fireEvent.click(screen.getByRole('button'));
      expect(handleQuickBet).toHaveBeenCalledWith(50);
    });

    it('disables when quick bet is not enabled', () => {
      render(<QuickBetButton amount={50} isQuickBetEnabled={false} odds={2.0} />);
      expect(screen.getByRole('button')).toBeDisabled();
    });
  });

  describe('BettingButtonGroup', () => {
    it('renders buttons in horizontal layout', () => {
      render(
        <BettingButtonGroup>
          <Button>Button 1</Button>
          <Button>Button 2</Button>
        </BettingButtonGroup>
      );
      const group = screen.getByRole('group');
      expect(group).toHaveClass('flex-row');
    });

    it('renders buttons in vertical layout', () => {
      render(
        <BettingButtonGroup orientation="vertical">
          <Button>Button 1</Button>
          <Button>Button 2</Button>
        </BettingButtonGroup>
      );
      const group = screen.getByRole('group');
      expect(group).toHaveClass('flex-col');
    });

    it('applies full width', () => {
      render(
        <BettingButtonGroup fullWidth>
          <Button>Button 1</Button>
          <Button>Button 2</Button>
        </BettingButtonGroup>
      );
      const group = screen.getByRole('group');
      expect(group).toHaveClass('w-full');
    });
  });
});
