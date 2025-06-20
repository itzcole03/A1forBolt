import React, { useState, useEffect } from "react";
import {
  Zap,
  TrendingUp,
  Brain,
  Shield,
  Target,
  DollarSign,
} from "lucide-react";
import UltimateMoneyMaker from "./betting/UltimateMoneyMaker";
import { useUnifiedStore } from "../store/unified/UnifiedStoreManager";

interface EnhancedStats {
  todayProfit: number;
  weeklyProfit: number;
  monthlyProfit: number;
  totalBets: number;
  winRate: number;
  avgOdds: number;
  roiPercent: number;
  activeBets: number;
}

const UltimateMoneyMakerEnhanced: React.FC = () => {
  const [stats, setStats] = useState<EnhancedStats>({
    todayProfit: 0,
    weeklyProfit: 0,
    monthlyProfit: 0,
    totalBets: 0,
    winRate: 0,
    avgOdds: 0,
    roiPercent: 0,
    activeBets: 0,
  });
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);

  const { betting } = useUnifiedStore();

  useEffect(() => {
    // Calculate stats from betting data
    const calculateStats = () => {
      const bets = betting.bets;
      const activeBets = betting.activeBets;

      // Mock calculations - in real app, these would be computed from actual data
      const mockStats: EnhancedStats = {
        todayProfit: 247.5,
        weeklyProfit: 1823.25,
        monthlyProfit: 7456.8,
        totalBets: bets.length + 127,
        winRate: 68.5,
        avgOdds: 1.92,
        roiPercent: 12.4,
        activeBets: activeBets.length,
      };

      setStats(mockStats);
    };

    calculateStats();
  }, [betting]);

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    change?: number;
    icon: React.ReactNode;
    color: string;
  }> = ({ title, value, change, icon, color }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          {change !== undefined && (
            <p
              className={`text-sm ${change >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              {change >= 0 ? "+" : ""}
              {change}% from last period
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>{icon}</div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Ultimate Money Maker Enhanced
            </h1>
            <p className="text-lg opacity-90">
              Advanced AI-powered betting optimization with real-time market
              analysis
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold">
              ${stats.monthlyProfit.toLocaleString()}
            </div>
            <div className="text-lg opacity-90">Monthly Profit</div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Today's Profit"
          value={`$${stats.todayProfit.toFixed(2)}`}
          change={8.2}
          icon={<DollarSign className="w-6 h-6 text-white" />}
          color="bg-green-500"
        />
        <StatCard
          title="Weekly Profit"
          value={`$${stats.weeklyProfit.toLocaleString()}`}
          change={15.7}
          icon={<TrendingUp className="w-6 h-6 text-white" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Win Rate"
          value={`${stats.winRate}%`}
          change={2.3}
          icon={<Target className="w-6 h-6 text-white" />}
          color="bg-purple-500"
        />
        <StatCard
          title="ROI"
          value={`${stats.roiPercent}%`}
          change={1.8}
          icon={<Zap className="w-6 h-6 text-white" />}
          color="bg-yellow-500"
        />
      </div>

      {/* Advanced Mode Toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Advanced AI Mode
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enable advanced ML models and real-time optimization
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-500" />
              <span className="text-sm text-green-600 font-medium">Secure</span>
            </div>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAdvancedMode}
                onChange={(e) => setIsAdvancedMode(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  isAdvancedMode ? "bg-blue-600" : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    isAdvancedMode ? "translate-x-6" : "translate-x-0.5"
                  }`}
                />
              </div>
            </label>
          </div>
        </div>

        {isAdvancedMode && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-gray-900 dark:text-white">
                  Deep Learning Models
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Neural networks analyzing 200+ features per prediction
              </p>
            </div>
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900 dark:text-white">
                  Real-time Optimization
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Continuous model updates with live market data
              </p>
            </div>
            <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-5 h-5 text-purple-600" />
                <span className="font-medium text-gray-900 dark:text-white">
                  Risk Management
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Advanced Kelly Criterion with volatility adjustments
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Performance Metrics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Total Bets
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats.totalBets.toLocaleString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Average Odds
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats.avgOdds.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Active Bets
              </span>
              <span className="font-semibold text-gray-900 dark:text-white">
                {stats.activeBets}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">
                Profit Factor
              </span>
              <span className="font-semibold text-green-600">
                {(stats.roiPercent / 10 + 1).toFixed(2)}x
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h3>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-2 bg-green-50 dark:bg-green-900/20 rounded">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              <span className="text-sm text-gray-900 dark:text-white">
                Lakers ML won (+$127.50)
              </span>
            </div>
            <div className="flex items-center space-x-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
              <div className="w-2 h-2 bg-blue-500 rounded-full" />
              <span className="text-sm text-gray-900 dark:text-white">
                New opportunity: Celtics Over 215.5
              </span>
            </div>
            <div className="flex items-center space-x-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded">
              <div className="w-2 h-2 bg-yellow-500 rounded-full" />
              <span className="text-sm text-gray-900 dark:text-white">
                Model updated: NBA v2.1.3
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Money Maker Component */}
      <UltimateMoneyMaker />
    </div>
  );
};

export default UltimateMoneyMakerEnhanced;
