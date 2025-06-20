import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Transaction {
  id: string;
  date: string;
  type: 'deposit' | 'withdrawal' | 'win' | 'loss';
  amount: number;
  description: string;
  balance: number;
}

/**
 * BankrollPage integrates with the backend API to fetch and display transaction history.
 * All integration points are type-safe and robust, with error and loading handling.
 * API endpoint: GET /api/transactions
 */
const BankrollPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | 'all'>('30d');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch transactions on mount
  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get<Transaction[]>('/api/transactions');
        setTransactions(res.data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || err.message || 'Failed to load transactions');
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to load transactions');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
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
    <main className="section space-y-6 lg:space-y-8 animate-fade-in">
      <div className="modern-card p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold">💰 Bankroll Management</h1>
          <div className="flex gap-4">
            <button className="modern-button">Deposit</button>
            <button className="modern-button bg-gray-500 hover:bg-gray-600">Withdraw</button>
          </div>
        </div>
        {/* Loading/Error State */}
        {loading ? (
          <div className="text-center text-gray-500 dark:text-gray-400">Loading...</div>
        ) : error ? (
          <div className="text-center text-red-600">{error}</div>
        ) : (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="modern-card p-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Current Balance
                </h3>
                <p className="text-2xl font-bold">${currentBalance.toFixed(2)}</p>
              </div>

              <div className="modern-card p-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Profit/Loss
                </h3>
                <p
                  className={`text-2xl font-bold ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {profitLoss >= 0 ? '+' : ''}
                  {profitLoss.toFixed(2)}
                </p>
              </div>

              <div className="modern-card p-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">ROI</h3>
                <p
                  className={`text-2xl font-bold ${Number(roi) >= 0 ? 'text-green-600' : 'text-red-600'}`}
                >
                  {Number(roi) >= 0 ? '+' : ''}
                  {roi}%
                </p>
              </div>

              <div className="modern-card p-6">
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Active Bets
                </h3>
                <p className="text-2xl font-bold">
                  {/* TODO: Fetch active bets count from backend */}0
                </p>
              </div>
            </div>

            {/* Chart Placeholder */}
            <div className="modern-card p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold">Balance History</h2>
                <div className="flex rounded-lg overflow-hidden">
                  {(['7d', '30d', '90d', 'all'] as const).map(t => (
                    <button
                      key={t}
                      className={`px-4 py-2 text-sm font-medium ${timeframe === t
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      onClick={() => setTimeframe(t)}
                    >
                      {t === 'all' ? 'All Time' : t}
                    </button>
                  ))}
                </div>
              </div>
              <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                {/* TODO: Implement real chart with data from backend */}
                Chart Placeholder
              </div>
            </div>

            {/* Transactions */}
            <div>
              <h2 className="text-lg font-bold mb-4">Transaction History</h2>
              <div className="overflow-x-auto">
                {transactions.length === 0 ? (
                  <div className="text-gray-500 dark:text-gray-400">
                    No transactions available.
                  </div>
                ) : (
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Balance
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {transactions.map(tx => (
                        <tr key={tx.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {new Date(tx.date).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`capitalize ${getTransactionColor(tx.type)}`}>
                              {tx.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={getTransactionColor(tx.type)}>
                              {tx.type === 'withdrawal' || tx.type === 'loss' ? '-' : '+'}${Math.abs(tx.amount).toFixed(2)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">{tx.description}</td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium">
                            ${tx.balance.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default React.memo(BankrollPage);
