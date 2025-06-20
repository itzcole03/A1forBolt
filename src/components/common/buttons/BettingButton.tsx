import React from 'react';
import { Button, ButtonProps } from './Button';
import { twMerge } from 'tailwind-merge';

export interface BettingButtonProps extends Omit<ButtonProps, 'variant'> {
  betType?: 'straight' | 'parlay' | 'teaser';
  odds?: number;
  stake?: number;
  potentialReturn?: number;
  isPlacing?: boolean;
  isConfirmed?: boolean;
  showDetails?: boolean;
}

export const BettingButton: React.FC<BettingButtonProps> = ({
  betType = 'straight',
  odds,
  stake,
  potentialReturn,
  isPlacing = false,
  isConfirmed = false,
  showDetails = false,
  className,
  children,
  ...props
}) => {
  const getVariant = () => {
    if (isConfirmed) return 'success';
    if (isPlacing) return 'primary';
    return 'primary';
  };

  const getButtonText = () => {
    if (isPlacing) return 'Placing Bet...';
    if (isConfirmed) return 'Bet Confirmed';
    return children || 'Place Bet';
  };

  const buttonStyles = twMerge(
    'relative overflow-hidden',
    showDetails && 'min-h-[80px]',
    className
  );

  return (
    <Button
      className={buttonStyles}
      disabled={isPlacing || isConfirmed}
      variant={getVariant()}
      {...props}
    >
      <div className="flex flex-col items-center justify-center w-full">
        <span className="font-medium">{getButtonText()}</span>

        {showDetails && (
          <div className="mt-1 text-sm opacity-90">
            {stake && <span className="mr-2">Stake: ${stake.toFixed(2)}</span>}
            {odds && <span className="mr-2">Odds: {odds.toFixed(2)}</span>}
            {potentialReturn && <span>Return: ${potentialReturn.toFixed(2)}</span>}
          </div>
        )}
      </div>

      {isPlacing && (
        <div className="absolute inset-0 bg-black/10 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </Button>
  );
};
