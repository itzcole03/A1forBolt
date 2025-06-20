import React, { useState, useEffect } from 'react';
import { UnifiedServiceRegistry } from '../../services/unified/UnifiedServiceRegistry';
import { UnifiedAnalyticsService } from '../../services/unified/UnifiedAnalyticsService';
import { UnifiedStateService } from '../../services/unified/UnifiedStateService';
import { UnifiedNotificationService } from '../../services/unified/UnifiedNotificationService';
import { UnifiedErrorService } from '../../services/unified/UnifiedErrorService';
import { Card, Button, Input, Select, Spinner, Toast, Badge, Modal } from '../ui/UnifiedUI';

interface Bet {
  id: string;
  eventId: string;
  eventName: string;
  marketType: string;
  selection: string;
  odds: number;
  stake: number;
  potentialReturn: number;
  status: 'pending' | 'won' | 'lost' | 'cancelled';
  placedAt: string;
  settledAt?: string;
  result?: {
    outcome: string;
    profit: number;
    roi: number;
  };
}

interface BettingStats {
  totalBets: number;
  wonBets: number;
  lostBets: number;
  pendingBets: number;
  totalStake: number;
  totalProfit: number;
  averageOdds: number;
  winRate: number;
  roi: number;
  bestWin: number;
  worstLoss: number;
  currentStreak: number;
  bestStreak: number;
}

interface FilterOptions {
  dateRange: 'day' | 'week' | 'month' | 'year' | 'all';
  status: 'all' | 'pending' | 'won' | 'lost' | 'cancelled';
  marketType: string;
  minOdds: number;
  maxOdds: number;
  minStake: number;
  maxStake: number;
  searchQuery: string;
}

export const UnifiedBettingHistory: React.FC = () => {
  // Initialize services
  const serviceRegistry = UnifiedServiceRegistry.getInstance();
  const analyticsService = serviceRegistry.getService<UnifiedAnalyticsService>('analytics');
  const stateService = serviceRegistry.getService<UnifiedStateService>('state');
  const notificationService =
    serviceRegistry.getService<UnifiedNotificationService>('notification');
  const errorService = serviceRegistry.getService<UnifiedErrorService>('error');

  // State
  const [bets, setBets] = useState<Bet[]>([]);
  const [stats, setStats] = useState<BettingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: 'month',
    status: 'all',
    marketType: 'all',
    minOdds: 0,
    maxOdds: 100,
    minStake: 0,
    maxStake: 1000000,
    searchQuery: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBet, setSelectedBet] = useState<Bet | null>(null);
  const [showBetDetails, setShowBetDetails] = useState(false);

  // Load betting history
  useEffect(() => {
    loadBettingHistory();
  }, [filters]);

  const loadBettingHistory = async () => {
    try {
      setLoading(true);
      const [betsData, statsData] = await Promise.all([
        analyticsService.getBettingHistory(filters),
        analyticsService.getBettingStats(filters),
      ]);
      setBets(betsData);
      setStats(statsData);
    } catch (error) {
      handleError('Failed to load betting history', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      dateRange: 'month',
      status: 'all',
      marketType: 'all',
      minOdds: 0,
      maxOdds: 100,
      minStake: 0,
      maxStake: 1000000,
      searchQuery: '',
    });
  };

  const handleError = (message: string, error: any) => {
    setError(message);
    setToast({ message, type: 'error' });
    errorService.handleError(error, {
      code: 'BETTING_HISTORY_ERROR',
      source: 'UnifiedBettingHistory',
      details: { message },
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100);
  };

  const getStatusBadge = (status: Bet['status']) => {
    const variants = {
      pending: 'warning',
      won: 'success',
      lost: 'danger',
      cancelled: 'secondary',
    };
    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Betting History</h1>
          <Button variant="secondary" onClick={() => setShowFilters(!showFilters)}>
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <h3 className="text-lg font-medium mb-2">Performance</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Win Rate</span>
                  <span className="font-medium">{formatPercentage(stats.winRate)}</span>
                </div>
                <div className="flex justify-between">
                  <span>ROI</span>
                  <span
                    className={`font-medium ${stats.roi >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {formatPercentage(stats.roi)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Current Streak</span>
                  <span className="font-medium">{stats.currentStreak}</span>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-medium mb-2">Bets</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Bets</span>
                  <span className="font-medium">{stats.totalBets}</span>
                </div>
                <div className="flex justify-between">
                  <span>Won</span>
                  <span className="font-medium text-green-600">{stats.wonBets}</span>
                </div>
                <div className="flex justify-between">
                  <span>Lost</span>
                  <span className="font-medium text-red-600">{stats.lostBets}</span>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-medium mb-2">Stakes & Returns</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Stake</span>
                  <span className="font-medium">{formatCurrency(stats.totalStake)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Profit</span>
                  <span
                    className={`font-medium ${stats.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}
                  >
                    {formatCurrency(stats.totalProfit)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Average Odds</span>
                  <span className="font-medium">{stats.averageOdds.toFixed(2)}</span>
                </div>
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-medium mb-2">Best & Worst</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Best Win</span>
                  <span className="font-medium text-green-600">
                    {formatCurrency(stats.bestWin)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Worst Loss</span>
                  <span className="font-medium text-red-600">
                    {formatCurrency(stats.worstLoss)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Best Streak</span>
                  <span className="font-medium">{stats.bestStreak}</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Filters */}
        {showFilters && (
          <Card className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Date Range
                </label>
                <Select
                  options={[
                    { value: 'day', label: 'Today' },
                    { value: 'week', label: 'This Week' },
                    { value: 'month', label: 'This Month' },
                    { value: 'year', label: 'This Year' },
                    { value: 'all', label: 'All Time' },
                  ]}
                  value={filters.dateRange}
                  onChange={e => handleFilterChange('dateRange', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <Select
                  options={[
                    { value: 'all', label: 'All' },
                    { value: 'pending', label: 'Pending' },
                    { value: 'won', label: 'Won' },
                    { value: 'lost', label: 'Lost' },
                    { value: 'cancelled', label: 'Cancelled' },
                  ]}
                  value={filters.status}
                  onChange={e => handleFilterChange('status', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Market Type
                </label>
                <Select
                  options={[
                    { value: 'all', label: 'All Markets' },
                    { value: 'match_winner', label: 'Match Winner' },
                    { value: 'over_under', label: 'Over/Under' },
                    { value: 'both_teams_to_score', label: 'Both Teams to Score' },
                    // Add more market types
                  ]}
                  value={filters.marketType}
                  onChange={e => handleFilterChange('marketType', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Search
                </label>
                <Input
                  placeholder="Search bets..."
                  type="text"
                  value={filters.searchQuery}
                  onChange={e => handleFilterChange('searchQuery', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Min Odds
                </label>
                <Input
                  min="0"
                  step="0.01"
                  type="number"
                  value={filters.minOdds}
                  onChange={e => handleFilterChange('minOdds', parseFloat(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Odds
                </label>
                <Input
                  min="0"
                  step="0.01"
                  type="number"
                  value={filters.maxOdds}
                  onChange={e => handleFilterChange('maxOdds', parseFloat(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Min Stake
                </label>
                <Input
                  min="0"
                  step="0.01"
                  type="number"
                  value={filters.minStake}
                  onChange={e => handleFilterChange('minStake', parseFloat(e.target.value))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Max Stake
                </label>
                <Input
                  min="0"
                  step="0.01"
                  type="number"
                  value={filters.maxStake}
                  onChange={e => handleFilterChange('maxStake', parseFloat(e.target.value))}
                />
              </div>
            </div>

            <div className="flex justify-end mt-4">
              <Button className="mr-4" variant="secondary" onClick={resetFilters}>
                Reset Filters
              </Button>
              <Button variant="primary" onClick={loadBettingHistory}>
                Apply Filters
              </Button>
            </div>
          </Card>
        )}

        {/* Betting History Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Event
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Market
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Selection
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Odds
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Stake
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Potential Return
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Placed
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {bets.map(bet => (
                  <tr key={bet.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {bet.eventName}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {bet.marketType}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{bet.selection}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {bet.odds.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatCurrency(bet.stake)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {formatCurrency(bet.potentialReturn)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(bet.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(bet.placedAt).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        size="small"
                        variant="secondary"
                        onClick={() => {
                          setSelectedBet(bet);
                          setShowBetDetails(true);
                        }}
                      >
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Bet Details Modal */}
      <Modal isOpen={showBetDetails} title="Bet Details" onClose={() => setShowBetDetails(false)}>
        {selectedBet && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium mb-2">Event Details</h3>
              <p className="text-gray-600 dark:text-gray-400">{selectedBet.eventName}</p>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2">Bet Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Market Type</span>
                  <span>{selectedBet.marketType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Selection</span>
                  <span>{selectedBet.selection}</span>
                </div>
                <div className="flex justify-between">
                  <span>Odds</span>
                  <span>{selectedBet.odds.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Stake</span>
                  <span>{formatCurrency(selectedBet.stake)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Potential Return</span>
                  <span>{formatCurrency(selectedBet.potentialReturn)}</span>
                </div>
              </div>
            </div>

            {selectedBet.result && (
              <div>
                <h3 className="text-lg font-medium mb-2">Result</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Outcome</span>
                    <span>{selectedBet.result.outcome}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Profit/Loss</span>
                    <span
                      className={selectedBet.result.profit >= 0 ? 'text-green-600' : 'text-red-600'}
                    >
                      {formatCurrency(selectedBet.result.profit)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>ROI</span>
                    <span
                      className={selectedBet.result.roi >= 0 ? 'text-green-600' : 'text-red-600'}
                    >
                      {formatPercentage(selectedBet.result.roi)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-medium mb-2">Timeline</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Placed At</span>
                  <span>{new Date(selectedBet.placedAt).toLocaleString()}</span>
                </div>
                {selectedBet.settledAt && (
                  <div className="flex justify-between">
                    <span>Settled At</span>
                    <span>{new Date(selectedBet.settledAt).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Toast Notifications */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
