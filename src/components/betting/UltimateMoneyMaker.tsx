import React, { useState, useEffect } from "react";
import {
  DollarSign,
  TrendingUp,
  Target,
  Zap,
  Brain,
  AlertCircle,
} from "lucide-react";
import { useBetting, useUser } from "../../store/unified/UnifiedStoreManager";
import { mlEngine } from "../../services/ml/UnifiedMLEngine";
import type { EnsemblePrediction } from "../../services/ml/UnifiedMLEngine";

interface OpportunityCandidate {
  id: string;
  eventId: string;
  market: string;
  description: string;
  currentOdds: number;
  predictedProbability: number;
  valueEdge: number;
  kellyFraction: number;
  recommendedStake: number;
  confidence: number;
  riskLevel: "low" | "medium" | "high";
  maxStake: number;
  expectedReturn: number;
}

const UltimateMoneyMaker: React.FC = () => {
  const [opportunities, setOpportunities] = useState<OpportunityCandidate[]>(
    [],
  );
  const [isScanning, setIsScanning] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<OpportunityCandidate | null>(null);
  const [stakeAmount, setStakeAmount] = useState(0);

  const { bankroll, addBet, addOpportunity } = useBetting();
  const { preferences } = useUser();

  // Scan for opportunities
  const scanForOpportunities = async () => {
    setIsScanning(true);
    try {
      // Simulate scanning process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const mockOpportunities: OpportunityCandidate[] = [
        {
          id: "opp-1",
          eventId: "game-lakers-warriors",
          market: "moneyline",
          description: "Lakers vs Warriors - Lakers ML",
          currentOdds: 2.1,
          predictedProbability: 0.52,
          valueEdge: 0.092,
          kellyFraction: 0.047,
          recommendedStake: Math.min(bankroll * 0.02, bankroll * 0.047 * 0.25),
          confidence: 0.78,
          riskLevel: "medium",
          maxStake: bankroll * 0.05,
          expectedReturn: 0,
        },
        {
          id: "opp-2",
          eventId: "game-celtics-heat",
          market: "total_points",
          description: "Celtics vs Heat - Over 215.5",
          currentOdds: 1.91,
          predictedProbability: 0.58,
          valueEdge: 0.108,
          kellyFraction: 0.062,
          recommendedStake: Math.min(bankroll * 0.03, bankroll * 0.062 * 0.25),
          confidence: 0.82,
          riskLevel: "low",
          maxStake: bankroll * 0.05,
          expectedReturn: 0,
        },
        {
          id: "opp-3",
          eventId: "game-mavs-suns",
          market: "player_props",
          description: "Luka Dončić Over 29.5 Points",
          currentOdds: 1.85,
          predictedProbability: 0.61,
          valueEdge: 0.129,
          kellyFraction: 0.071,
          recommendedStake: Math.min(bankroll * 0.025, bankroll * 0.071 * 0.25),
          confidence: 0.85,
          riskLevel: "low",
          maxStake: bankroll * 0.04,
          expectedReturn: 0,
        },
      ];

      // Calculate expected returns
      mockOpportunities.forEach((opp) => {
        opp.expectedReturn =
          opp.recommendedStake *
          (opp.currentOdds - 1) *
          opp.predictedProbability;
      });

      setOpportunities(mockOpportunities);

      // Add to betting store
      mockOpportunities.forEach((opp) => {
        addOpportunity({
          id: opp.id,
          eventId: opp.eventId,
          market: opp.market,
          odds: opp.currentOdds,
          prediction: {
            id: opp.id,
            confidence: opp.confidence,
            predictedValue: opp.predictedProbability,
            factors: [],
            timestamp: Date.now(),
          },
          valueEdge: opp.valueEdge,
          kellyFraction: opp.kellyFraction,
          recommendedStake: opp.recommendedStake,
          timestamp: Date.now(),
        });
      });
    } catch (error) {
      console.error("Failed to scan for opportunities:", error);
    } finally {
      setIsScanning(false);
    }
  };

  // Place bet
  const placeBet = (opportunity: OpportunityCandidate, amount: number) => {
    addBet({
      eventId: opportunity.eventId,
      amount,
      odds: opportunity.currentOdds,
      status: "active",
      prediction: {
        id: opportunity.id,
        confidence: opportunity.confidence,
        predictedValue: opportunity.predictedProbability,
        factors: [],
        timestamp: Date.now(),
      },
    });

    setSelectedOpportunity(null);
    setStakeAmount(0);
  };

  // Auto-scan when component mounts
  useEffect(() => {
    scanForOpportunities();
  }, []);

  // Auto-mode scanning
  useEffect(() => {
    if (!autoMode) return;

    const interval = setInterval(() => {
      scanForOpportunities();
    }, 60000); // Scan every minute

    return () => clearInterval(interval);
  }, [autoMode]);

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-green-600 bg-green-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "high":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const totalPotentialReturn = opportunities.reduce(
    (sum, opp) => sum + opp.expectedReturn,
    0,
  );
  const averageConfidence =
    opportunities.length > 0
      ? opportunities.reduce((sum, opp) => sum + opp.confidence, 0) /
        opportunities.length
      : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">Ultimate Money Maker</h1>
            <p className="opacity-90">AI-powered value betting opportunities</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">
              ${totalPotentialReturn.toFixed(2)}
            </div>
            <div className="opacity-90">Potential Return</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Opportunity Scanner
          </h2>
          <div className="flex items-center space-x-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={autoMode}
                onChange={(e) => setAutoMode(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Auto Mode
              </span>
            </label>
            <button
              onClick={scanForOpportunities}
              disabled={isScanning}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isScanning ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Scanning...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  <span>Scan Now</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {opportunities.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Opportunities
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {(averageConfidence * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Avg Confidence
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              ${bankroll.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Bankroll
            </div>
          </div>
          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {opportunities.filter((o) => o.riskLevel === "low").length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Low Risk
            </div>
          </div>
        </div>
      </div>

      {/* Opportunities */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Current Opportunities
        </h2>

        {opportunities.length === 0 ? (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              {isScanning
                ? "Scanning for opportunities..."
                : "No opportunities found. Click scan to search for value bets."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {opportunities.map((opportunity) => (
              <div
                key={opportunity.id}
                className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {opportunity.description}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>Odds: {opportunity.currentOdds}</span>
                      <span>•</span>
                      <span>
                        Edge: {(opportunity.valueEdge * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getRiskColor(opportunity.riskLevel)}`}
                    >
                      {opportunity.riskLevel.toUpperCase()}
                    </span>
                    <span className="text-lg font-bold text-green-600">
                      ${opportunity.expectedReturn.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-3">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Confidence
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {(opportunity.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Probability
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {(opportunity.predictedProbability * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Kelly %
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {(opportunity.kellyFraction * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Recommended
                    </div>
                    <div className="font-semibold text-green-600">
                      ${opportunity.recommendedStake.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Max Stake
                    </div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      ${opportunity.maxStake.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <Target className="w-4 h-4" />
                    <span>
                      Expected Return: ${opportunity.expectedReturn.toFixed(2)}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedOpportunity(opportunity);
                      setStakeAmount(opportunity.recommendedStake);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <DollarSign className="w-4 h-4" />
                    <span>Place Bet</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bet Placement Modal */}
      {selectedOpportunity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Place Bet
            </h3>

            <div className="mb-4">
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {selectedOpportunity.description}
              </p>
              <div className="text-sm text-gray-500 dark:text-gray-500">
                Odds: {selectedOpportunity.currentOdds} • Confidence:{" "}
                {(selectedOpportunity.confidence * 100).toFixed(0)}%
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Stake Amount
              </label>
              <input
                type="number"
                value={stakeAmount}
                onChange={(e) =>
                  setStakeAmount(parseFloat(e.target.value) || 0)
                }
                min="1"
                max={selectedOpportunity.maxStake}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mt-1">
                <span>
                  Recommended: $
                  {selectedOpportunity.recommendedStake.toFixed(2)}
                </span>
                <span>Max: ${selectedOpportunity.maxStake.toFixed(2)}</span>
              </div>
            </div>

            {stakeAmount > 0 && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>Potential Win:</span>
                  <span className="font-semibold text-green-600">
                    $
                    {(
                      (selectedOpportunity.currentOdds - 1) *
                      stakeAmount
                    ).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Total Return:</span>
                  <span className="font-semibold">
                    $
                    {(selectedOpportunity.currentOdds * stakeAmount).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setSelectedOpportunity(null);
                  setStakeAmount(0);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => placeBet(selectedOpportunity, stakeAmount)}
                disabled={
                  stakeAmount <= 0 ||
                  stakeAmount > selectedOpportunity.maxStake ||
                  stakeAmount > bankroll
                }
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Bet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UltimateMoneyMaker;
