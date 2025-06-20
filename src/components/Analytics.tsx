import React, { useMemo, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { ArbitrageOpportunity } from '../types';
import { FaChartLine, FaCalculator, FaExchangeAlt } from 'react-icons/fa';
import { Line } from 'react-chartjs-2';
import { calculateKellyCriterion, americanToDecimal } from '../utils/odds';
import { motion } from 'framer-motion';
import { useApiRequest } from '../hooks/useApiRequest';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * Analytics component displays user betting performance metrics, a Kelly Criterion calculator,
 * and arbitrage opportunities. Uses memoization for performance optimization.
 */

interface PerformanceData {
  totalBets: number;
  winRate: number;
  profit: number;
  roi: number;
  recentHistory: {
    labels: string[];
    datasets: Array<{
      label: string;
      data: number[];
      borderColor?: string;
      backgroundColor?: string;
    }>;
  };
}

const Analytics: React.FC = () => {
  // State for Kelly calculator
  const [kellyBankroll, setKellyBankroll] = useState<number>(1000);
  const [kellyProb, setKellyProb] = useState<number>(0.5);
  const [kellyOdds, setKellyOdds] = useState<number>(-110);
  const [kellyFraction, setKellyFraction] = useState<number>(1);

  // Fetch user performance data
  const {
    data: perf,
    isLoading: perfLoading,
    error: perfError,
  } = useApiRequest<PerformanceData>('/api/user/performance');
  // Fetch arbitrage opportunities
  const {
    data: arbs,
    isLoading: arbsLoading,
    error: arbsError,
  } = useApiRequest<ArbitrageOpportunity[]>('/api/arbitrage/opportunities');

  // Chart data for recent history
  const chartData = useMemo(() => {
    if (!perf) {
      return {
        labels: [],
        datasets: [],
      };
    }
    return {
      labels: perf.recentHistory.labels,
      datasets: perf.recentHistory.datasets.map((dataset) => ({
        ...dataset,
        fill: true,
        tension: 0.4,
        borderColor: dataset.borderColor || 'rgb(16, 185, 129)',
        backgroundColor: dataset.backgroundColor || 'rgba(16, 185, 129, 0.1)',
      })),
    };
  }, [perf]);

  // Kelly calculation
  const kellyStake = useMemo(() => {
    const decOdds = americanToDecimal(Number(kellyOdds));
    return calculateKellyCriterion(
      Number(kellyProb),
      decOdds,
      Number(kellyBankroll),
      Number(kellyFraction)
    );
  }, [kellyBankroll, kellyProb, kellyOdds, kellyFraction]);

  return (
    <div className="space-y-6">
      {/* Performance Metrics */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="glass-morphism p-6 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FaChartLine className="w-5 h-5 mr-2 text-primary-500" />
          My Performance
        </h3>
        {perfLoading ? (
          <div className="text-gray-500 animate-pulse-soft">Loading performance...</div>
        ) : perfError ? (
          <div className="text-red-500">{perfError.message}</div>
        ) : perf ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <div className="text-xs text-gray-500">Total Bets</div>
              <div className="text-2xl font-bold">{perf.totalBets}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Win Rate</div>
              <div className="text-2xl font-bold text-green-600">
                {(perf.winRate * 100).toFixed(1)}%
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Profit</div>
              <div className="text-2xl font-bold text-blue-600">
                ${perf.profit.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-500">ROI</div>
              <div className="text-2xl font-bold text-purple-600">
                {(perf.roi * 100).toFixed(1)}%
              </div>
            </div>
          </div>
        ) : null}
        {/* Recent History Chart */}
        <div className="h-64">
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              animation: { duration: 800 },
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(156,163,175,0.1)' } },
                x: { grid: { display: false } },
              },
            }}
          />
        </div>
      </motion.div>

      {/* Kelly Criterion Calculator */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="glass-morphism p-6 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FaCalculator className="w-5 h-5 mr-2 text-primary-500" />
          Kelly Criterion Calculator
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1">Bankroll</label>
            <input
              className="premium-input w-full"
              min={1}
              type="number"
              value={kellyBankroll}
              onChange={e => setKellyBankroll(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Win Probability</label>
            <input
              className="premium-input w-full"
              max={1}
              min={0}
              step={0.01}
              type="number"
              value={kellyProb}
              onChange={e => setKellyProb(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Odds (American)</label>
            <input
              className="premium-input w-full"
              type="number"
              value={kellyOdds}
              onChange={e => setKellyOdds(Number(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">Fraction</label>
            <input
              className="premium-input w-full"
              max={1}
              min={0.01}
              step={0.01}
              type="number"
              value={kellyFraction}
              onChange={e => setKellyFraction(Number(e.target.value))}
            />
          </div>
        </div>
        <div className="mt-2 text-lg font-bold text-green-600">
          Optimal Bet: ${kellyStake.toFixed(2)}
        </div>
      </motion.div>

      {/* Arbitrage Opportunities */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="glass-morphism p-6 rounded-xl"
        initial={{ opacity: 0, y: 20 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-lg font-semibold mb-4 flex items-center">
          <FaExchangeAlt className="w-5 h-5 mr-2 text-primary-500" />
          Arbitrage Opportunities
        </h3>
        {arbsLoading ? (
          <div className="text-gray-500 animate-pulse-soft">Loading opportunities...</div>
        ) : arbsError ? (
          <div className="text-red-500">{arbsError.message}</div>
        ) : arbs && arbs.length > 0 ? (
          <div className="space-y-4">
            {arbs.map(opp => (
              <div
                key={opp.id}
                className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">{opp.player.name}</span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {opp.player.team.abbreviation}
                      </span>
                      <span className="text-xs bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded">
                        {opp.propType}
                      </span>
                    </div>
                    <div className="mt-2 grid grid-cols-2 gap-4">
                      {opp.books.map(book => (
                        <div key={book.name} className="text-sm">
                          <span className="text-gray-600 dark:text-gray-400">{book.name}:</span>
                          <span className="ml-1 font-medium">
                            {book.line} @ {book.odds > 0 ? '+' : ''}
                            {book.odds}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        Potential Profit
                      </span>
                      <span className="text-lg font-bold text-green-500">
                        ${opp.potentialProfit.toFixed(2)}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-gray-400">
                      Expires: {new Date(opp.expiresAt).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-500">No arbitrage opportunities found.</div>
        )}
      </motion.div>
    </div>
  );
}

// React.memo is used here to prevent unnecessary re-renders of Analytics when its props/state do not change.
// This is beneficial because Analytics fetches data and renders charts, which can be expensive operations.
export default React.memo(Analytics);
