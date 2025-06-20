import React from 'react';
import { Button, ButtonProps } from './Button';
import { twMerge } from 'tailwind-merge';

export interface QuickBetButtonProps extends Omit<ButtonProps, 'variant' | 'size'> {
  amount: number;
  odds: number;
  isActive?: boolean;
  isQuickBetEnabled?: boolean;
  onQuickBet?: (amount: number) => void;
}

export const QuickBetButton: React.FC<QuickBetButtonProps> = ({
  amount,
  odds,
  isActive = false,
  isQuickBetEnabled = true,
  onQuickBet,
  className,
  ...props
}) => {
  const potentialReturn = amount * odds;
  const buttonStyles = twMerge(
    'relative overflow-hidden transition-all duration-200',
    isActive ? 'ring-2 ring-primary-500' : '',
    isQuickBetEnabled ? 'hover:scale-105' : 'opacity-50 cursor-not-allowed',
    className
  );

  const handleClick = () => {
    if (isQuickBetEnabled && onQuickBet) {
      onQuickBet(amount);
    }
  };

  return (
    <Button
      className={buttonStyles}
      disabled={!isQuickBetEnabled}
      size="sm"
      variant="primary"
      onClick={handleClick}
      {...props}
    >
      <div className="flex flex-col items-center justify-center">
        <span className="font-medium">${amount}</span>
        <span className="text-xs opacity-90">Return: ${potentialReturn.toFixed(2)}</span>
      </div>
    </Button>
  );
};
