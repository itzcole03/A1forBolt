import React, { useState, useEffect } from 'react';
import GlassCard from '../components/ui/GlassCard';
import GlowButton from '../components/ui/GlowButton';
import Tooltip from '../components/ui/Tooltip';

interface Transaction {
  id: string;
  date: string;
  type: 'deposit' | 'withdrawal' | 'win' | 'loss';
  amount: number;
  description: string;
  balance: number;
}

const fetchTransactions = async (): Promise<Transaction[]> => {
  // Replace with real API call
  const res = await fetch('/api/transactions');
  if (!res.ok) throw new Error('Failed to fetch transactions');
  return res.json();
};

const fetchActiveBetsCount = async (): Promise<number> => {
  // Replace with real API call
  const res = await fetch('/api/active-bets/count');
  if (!res.ok) throw new Error('Failed to fetch active bets count');
  const data = await res.json();
  return data.count;
};

const BankrollPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeBetsCount, setActiveBetsCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | 'all'>('30d');

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([fetchTransactions(), fetchActiveBetsCount()])
      .then(([txs, betsCount]) => {
        setTransactions(txs);
        setActiveBetsCount(betsCount);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load data');
        setLoading(false);
      });
  }, []);

  const currentBalance = transactions[transactions.length - 1]?.balance || 0;
  const initialBalance = transactions[0]?.balance || 0;
  const profitLoss = currentBalance - initialBalance;
  const roi = initialBalance !== 0 ? ((profitLoss / initialBalance) * 100).toFixed(2) : '0.00';

  const getTransactionColor = (type: Transaction['type']) => {
    switch (type) {
      case 'deposit':
        return 'text-blue-600 dark:text-blue-400';
      case 'withdrawal':
        return 'text-orange-600 dark:text-orange-400';
      case 'win':
        return 'text-green-600 dark:text-green-400';
      case 'loss':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  return (
    <div className="p-6 space-y-8 min-h-screen bg-gradient-to-br from-green-900/80 to-green-700/80 dark:from-gray-900 dark:to-gray-800 transition-colors">
      <GlassCard className="mb-8">
        <h2 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-4">Bankroll Overview</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div>
            <Tooltip content="Your current bankroll balance.">
              <div className="text-xs text-gray-400">Current Balance</div>
            </Tooltip>
            <div className="text-2xl font-bold text-primary-600">${currentBalance.toLocaleString()}</div>
          </div>
          <div>
            <Tooltip content="Your initial balance for this period.">
              <div className="text-xs text-gray-400">Initial Balance</div>
            </Tooltip>
            <div className="text-2xl font-bold text-blue-600">${initialBalance.toLocaleString()}</div>
          </div>
          <div>
            <Tooltip content="Your profit or loss for this period.">
              <div className="text-xs text-gray-400">Profit / Loss</div>
            </Tooltip>
            <div className={`text-2xl font-bold ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>${profitLoss.toLocaleString()}</div>
          </div>
          <div>
            <Tooltip content="Return on investment (ROI) for this period.">
              <div className="text-xs text-gray-400">ROI</div>
            </Tooltip>
            <div className="text-2xl font-bold text-purple-600">{roi}%</div>
          </div>
        </div>
        <div className="flex gap-4 mb-4">
          <GlowButton onClick={() => setTimeframe('7d')} className={timeframe === '7d' ? 'bg-primary-500' : ''}>7D</GlowButton>
          <GlowButton onClick={() => setTimeframe('30d')} className={timeframe === '30d' ? 'bg-primary-500' : ''}>30D</GlowButton>
          <GlowButton onClick={() => setTimeframe('90d')} className={timeframe === '90d' ? 'bg-primary-500' : ''}>90D</GlowButton>
          <GlowButton onClick={() => setTimeframe('all')} className={timeframe === 'all' ? 'bg-primary-500' : ''}>All</GlowButton>
        </div>
      </GlassCard>
      <GlassCard>
        <h3 className="text-xl font-semibold mb-4">Transaction History</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400">
                <th>Date</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Description</th>
                <th>Balance</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-2">{tx.date}</td>
                  <td className={`py-2 ${getTransactionColor(tx.type)}`}>{tx.type}</td>
                  <td className="py-2">${tx.amount.toLocaleString()}</td>
                  <td className="py-2">{tx.description}</td>
                  <td className="py-2">${tx.balance.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
};

export default BankrollPage;
