import React, { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Clock,
  AlertCircle,
  CheckCircle,
  Zap,
  BarChart3,
  Filter,
  Search,
  RefreshCw,
  Play,
  Pause,
  Settings,
} from "lucide-react";
import {
  useBetting,
  useUser,
  useUI,
} from "../../store/unified/UnifiedStoreManager";
import { dataPipeline } from "../../services/data/UnifiedDataPipeline";
import type {
  OddsData,
  GameData,
} from "../../services/data/UnifiedDataPipeline";

interface BettingMarket {
  id: string;
  name: string;
  sport: string;
  event: string;
  type: "moneyline" | "spread" | "total" | "props";
  odds: OddsData[];
  volume: number;
  lastUpdate: Date;
  trend: "up" | "down" | "stable";
  valueScore: number;
}

interface LiveGame {
  id: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  status: "scheduled" | "live" | "finished";
  startTime: Date;
  markets: BettingMarket[];
  liveScore?: {
    home: number;
    away: number;
    period: string;
    timeRemaining?: string;
  };
}

const UnifiedBettingInterface: React.FC = () => {
  const [liveGames, setLiveGames] = useState<LiveGame[]>([]);
  const [selectedSport, setSelectedSport] = useState<string>("all");
  const [selectedMarket, setSelectedMarket] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"value" | "volume" | "odds">("value");
  const [isLiveMode, setIsLiveMode] = useState(true);
  const [selectedBet, setSelectedBet] = useState<BettingMarket | null>(null);
  const [stakeAmount, setStakeAmount] = useState<number>(0);

  const { bankroll, addBet, opportunities } = useBetting();
  const { preferences } = useUser();
  const { addToast } = useUI();

  useEffect(() => {
    const loadLiveGames = async () => {
      try {
        // Mock live games data - in real app, this would come from data pipeline
        const mockGames: LiveGame[] = [
          {
            id: "game-1",
            sport: "NBA",
            homeTeam: "Los Angeles Lakers",
            awayTeam: "Golden State Warriors",
            status: "live",
            startTime: new Date(),
            liveScore: {
              home: 78,
              away: 82,
              period: "3rd Quarter",
              timeRemaining: "8:45",
            },
            markets: [
              {
                id: "market-1",
                name: "Lakers vs Warriors - Moneyline",
                sport: "NBA",
                event: "Lakers vs Warriors",
                type: "moneyline",
                odds: [
                  {
                    eventId: "game-1",
                    bookmaker: "DraftKings",
                    market: "moneyline",
                    outcomes: [
                      { name: "Lakers", odds: 2.1 },
                      { name: "Warriors", odds: 1.8 },
                    ],
                    timestamp: Date.now(),
                  },
                ],
                volume: 85000,
                lastUpdate: new Date(),
                trend: "up",
                valueScore: 8.5,
              },
              {
                id: "market-2",
                name: "Lakers vs Warriors - Total Points",
                sport: "NBA",
                event: "Lakers vs Warriors",
                type: "total",
                odds: [
                  {
                    eventId: "game-1",
                    bookmaker: "FanDuel",
                    market: "totals",
                    outcomes: [
                      { name: "Over 225.5", odds: 1.9 },
                      { name: "Under 225.5", odds: 1.9 },
                    ],
                    timestamp: Date.now(),
                  },
                ],
                volume: 92000,
                lastUpdate: new Date(),
                trend: "down",
                valueScore: 7.2,
              },
            ],
          },
          {
            id: "game-2",
            sport: "NBA",
            homeTeam: "Boston Celtics",
            awayTeam: "Miami Heat",
            status: "scheduled",
            startTime: new Date(Date.now() + 3600000), // 1 hour from now
            markets: [
              {
                id: "market-3",
                name: "Celtics vs Heat - Spread",
                sport: "NBA",
                event: "Celtics vs Heat",
                type: "spread",
                odds: [
                  {
                    eventId: "game-2",
                    bookmaker: "BetMGM",
                    market: "spreads",
                    outcomes: [
                      { name: "Celtics -4.5", odds: 1.91 },
                      { name: "Heat +4.5", odds: 1.91 },
                    ],
                    timestamp: Date.now(),
                  },
                ],
                volume: 67000,
                lastUpdate: new Date(),
                trend: "stable",
                valueScore: 9.1,
              },
            ],
          },
        ];

        setLiveGames(mockGames);
      } catch (error) {
        addToast({
          type: "error",
          title: "Loading Failed",
          message: "Failed to load live betting markets",
        });
      }
    };

    loadLiveGames();

    if (isLiveMode) {
      const interval = setInterval(loadLiveGames, 5000); // Update every 5 seconds in live mode
      return () => clearInterval(interval);
    }
  }, [isLiveMode, addToast]);

  const filteredMarkets = liveGames
    .flatMap((game) => game.markets)
    .filter((market) => {
      const matchesSport =
        selectedSport === "all" || market.sport === selectedSport;
      const matchesMarket =
        selectedMarket === "all" || market.type === selectedMarket;
      const matchesSearch =
        searchTerm === "" ||
        market.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        market.event.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSport && matchesMarket && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "value":
          return b.valueScore - a.valueScore;
        case "volume":
          return b.volume - a.volume;
        case "odds":
          return (
            (a.odds[0]?.outcomes[0]?.odds || 0) -
            (b.odds[0]?.outcomes[0]?.odds || 0)
          );
        default:
          return 0;
      }
    });

  const placeBet = (
    market: BettingMarket,
    outcome: string,
    odds: number,
    amount: number,
  ) => {
    if (amount > bankroll) {
      addToast({
        type: "error",
        title: "Insufficient Funds",
        message: "Bet amount exceeds available bankroll",
      });
      return;
    }

    if (amount < 1) {
      addToast({
        type: "error",
        title: "Invalid Amount",
        message: "Bet amount must be at least $1",
      });
      return;
    }

    addBet({
      eventId: market.id,
      amount,
      odds,
      status: "active",
    });

    addToast({
      type: "success",
      title: "Bet Placed",
      message: `${outcome} - $${amount} at ${odds}`,
    });

    setSelectedBet(null);
    setStakeAmount(0);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <BarChart3 className="w-4 h-4 text-gray-500" />;
    }
  };

  const getValueColor = (score: number) => {
    if (score >= 8) return "text-green-600 bg-green-100";
    if (score >= 6) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const MarketCard: React.FC<{ market: BettingMarket }> = ({ market }) => {
    const game = liveGames.find((g) => g.markets.includes(market));

    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 hover:shadow-md transition-shadow">
        {/* Market Header */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
              {market.event}
            </h3>
            <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
              <span>{market.sport}</span>
              <span>•</span>
              <span>{market.type.toUpperCase()}</span>
              {game?.status === "live" && (
                <>
                  <span>•</span>
                  <span className="text-red-500 font-medium">LIVE</span>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {getTrendIcon(market.trend)}
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${getValueColor(market.valueScore)}`}
            >
              {market.valueScore.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Live Score (if applicable) */}
        {game?.liveScore && (
          <div className="mb-3 p-2 bg-gray-50 dark:bg-gray-700 rounded text-xs">
            <div className="flex justify-between items-center">
              <span>
                {game.homeTeam}: {game.liveScore.home}
              </span>
              <span className="font-medium">{game.liveScore.period}</span>
              <span>
                {game.awayTeam}: {game.liveScore.away}
              </span>
            </div>
            {game.liveScore.timeRemaining && (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-1">
                {game.liveScore.timeRemaining}
              </div>
            )}
          </div>
        )}

        {/* Betting Options */}
        <div className="space-y-2 mb-3">
          {market.odds[0]?.outcomes.map((outcome, index) => (
            <button
              key={index}
              onClick={() => {
                setSelectedBet(market);
                setStakeAmount(preferences.bankrollPercentage * bankroll);
              }}
              className="w-full flex items-center justify-between p-2 border border-gray-200 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <span className="font-medium text-gray-900 dark:text-white text-sm">
                {outcome.name}
              </span>
              <span className="font-bold text-blue-600">
                {outcome.odds.toFixed(2)}
              </span>
            </button>
          ))}
        </div>

        {/* Market Info */}
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-3 h-3" />
            <span>Volume: ${market.volume.toLocaleString()}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{market.lastUpdate.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Unified Betting Interface
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Real-time betting markets with AI-powered value analysis
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-xl font-bold text-gray-900 dark:text-white">
              ${bankroll.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Bankroll
            </div>
          </div>

          <button
            onClick={() => setIsLiveMode(!isLiveMode)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg font-medium transition-colors ${
              isLiveMode
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {isLiveMode ? (
              <Play className="w-4 h-4" />
            ) : (
              <Pause className="w-4 h-4" />
            )}
            <span>{isLiveMode ? "LIVE" : "PAUSED"}</span>
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search markets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Sport Filter */}
          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Sports</option>
            <option value="NBA">NBA</option>
            <option value="NFL">NFL</option>
            <option value="MLB">MLB</option>
            <option value="EPL">EPL</option>
          </select>

          {/* Market Filter */}
          <select
            value={selectedMarket}
            onChange={(e) => setSelectedMarket(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Markets</option>
            <option value="moneyline">Moneyline</option>
            <option value="spread">Spread</option>
            <option value="total">Totals</option>
            <option value="props">Player Props</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="value">Sort by Value</option>
            <option value="volume">Sort by Volume</option>
            <option value="odds">Sort by Odds</option>
          </select>

          {/* Refresh */}
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Target className="w-5 h-5 text-blue-600" />
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {filteredMarkets.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Markets
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-green-600" />
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {liveGames.filter((g) => g.status === "live").length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Live Games
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {opportunities.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Opportunities
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-yellow-600" />
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {filteredMarkets.length > 0
                  ? (
                      filteredMarkets.reduce(
                        (sum, m) => sum + m.valueScore,
                        0,
                      ) / filteredMarkets.length
                    ).toFixed(1)
                  : "0.0"}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Avg Value
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Markets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredMarkets.map((market) => (
          <MarketCard key={market.id} market={market} />
        ))}
      </div>

      {/* No Markets */}
      {filteredMarkets.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">🎯</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No markets found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your filters or check back later for new opportunities
          </p>
        </div>
      )}

      {/* Bet Placement Modal */}
      {selectedBet && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Place Bet
            </h3>

            <div className="mb-4">
              <p className="text-gray-600 dark:text-gray-400 mb-2">
                {selectedBet.name}
              </p>
            </div>

            <div className="space-y-3 mb-4">
              {selectedBet.odds[0]?.outcomes.map((outcome, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg"
                >
                  <span className="font-medium text-gray-900 dark:text-white">
                    {outcome.name}
                  </span>
                  <span className="font-bold text-blue-600">
                    {outcome.odds.toFixed(2)}
                  </span>
                </div>
              ))}
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
                max={bankroll}
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mt-1">
                <span>Min: $1</span>
                <span>Max: ${bankroll.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setSelectedBet(null);
                  setStakeAmount(0);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const outcome = selectedBet.odds[0]?.outcomes[0];
                  if (outcome) {
                    placeBet(
                      selectedBet,
                      outcome.name,
                      outcome.odds,
                      stakeAmount,
                    );
                  }
                }}
                disabled={stakeAmount <= 0 || stakeAmount > bankroll}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Place Bet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnifiedBettingInterface;
