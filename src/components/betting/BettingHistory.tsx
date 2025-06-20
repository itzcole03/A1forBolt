import React, { useEffect, useState } from 'react';
import { Card, Badge, Icon, Spinner } from '../ui/UnifiedUI.js';
import { UnifiedServiceRegistry } from '../../services/unified/UnifiedServiceRegistry.js';
import { UnifiedBettingService } from '../../services/unified/UnifiedBettingService.js';
import { Bet } from '../../types/betting.js';

interface BettingHistoryProps {
  eventId: string;
  marketId: string;
  selectionId: string;
  className?: string;
}

export const BettingHistory: React.FC<BettingHistoryProps> = ({
  eventId,
  marketId,
  selectionId,
  className = '',
}) => {
  const [bets, setBets] = useState<Bet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const serviceRegistry = UnifiedServiceRegistry.getInstance();
  const bettingService = serviceRegistry.getService<UnifiedBettingService>('betting');

  useEffect(() => {
    const loadBets = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!bettingService) {
          setError('Betting service unavailable');
          setBets([]);
          return;
        }

        const history = await bettingService.getBettingHistory(eventId, marketId, selectionId);
        setBets(history);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load betting history');
      } finally {
        setIsLoading(false);
      }
    }; loadBets();
  }, [eventId, marketId, selectionId, bettingService]);

  const getOutcomeColor = (outcome: Bet['outcome']): string => {
    switch (outcome) {
      case 'won':
        return 'text-green-500';
      case 'lost':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getOutcomeIcon = (outcome: Bet['outcome']): string => {
    switch (outcome) {
      case 'won':
        return 'check-circle';
      case 'lost':
        return 'x-circle';
      default:
        return 'clock';
    }
  };

  if (isLoading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="flex justify-center items-center h-32">
          <Spinner size="large" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-red-500 text-center">
          <Icon className="w-8 h-8 mx-auto mb-2" name="exclamation-circle" />
          <p>{error}</p>
        </div>
      </Card>
    );
  }

  if (bets.length === 0) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <Icon className="w-8 h-8 mx-auto mb-2" name="document-text" />
          <p>No betting history available</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Betting History</h3>

      <div className="space-y-4">
        {bets.map(bet => (
          <div
            key={bet.id}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
            role="listitem"
          >
            <div className="flex items-center space-x-4">
              <Icon
                aria-label={`Outcome: ${bet.outcome}`}
                className={`w-6 h-6 ${getOutcomeColor(bet.outcome)}`}
                name={getOutcomeIcon(bet.outcome)}
              />
              <div>
                <p className="font-medium">{bet.marketName}</p>
                <p className="text-sm text-gray-600">{new Date(bet.timestamp).toLocaleString()}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="flex items-center space-x-2">
                <Badge
                  variant={
                    bet.outcome === 'won'
                      ? 'success'
                      : bet.outcome === 'lost'
                        ? 'danger'
                        : 'info'
                  }
                >
                  {bet.outcome}
                </Badge>
                <p className={`font-semibold ${getOutcomeColor(bet.outcome)}`}>
                  {bet.outcome === 'won' ? '+' : bet.outcome === 'lost' ? '-' : ''}
                  {bet.stake.toFixed(2)}
                </p>
              </div>
              <p className="text-sm text-gray-600">Odds: {bet.odds.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Bets</p>
            <p className="text-lg font-semibold">{bets.length}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Win Rate</p>
            <p className="text-lg font-semibold">
              {((bets.filter(b => b.outcome === 'won').length / bets.length) * 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Profit/Loss</p>
            <p className="text-lg font-semibold">
              {bets
                .reduce((acc, bet) => {
                  if (bet.outcome === 'won') return acc + (bet.stake * bet.odds - bet.stake);
                  if (bet.outcome === 'lost') return acc - bet.stake;
                  return acc;
                }, 0)
                .toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};
