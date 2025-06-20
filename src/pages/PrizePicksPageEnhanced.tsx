import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Clock,
  Star,
} from "lucide-react";
import { useUnifiedStore } from "../store/unified/UnifiedStoreManager";
import { dataPipeline } from "../services/data/UnifiedDataPipeline";

interface PlayerProjection {
  id: string;
  playerName: string;
  team: string;
  position: string;
  statType: string;
  line: number;
  over: number;
  under: number;
  confidence: number;
  trend: "up" | "down" | "stable";
  recent: number[];
}

const PrizePicksPageEnhanced: React.FC = () => {
  const [projections, setProjections] = useState<PlayerProjection[]>([]);
  const [filteredProjections, setFilteredProjections] = useState<
    PlayerProjection[]
  >([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSport, setSelectedSport] = useState("basketball_nba");
  const [selectedPosition, setSelectedPosition] = useState("all");
  const [minConfidence, setMinConfidence] = useState(0.6);
  const [isLoading, setIsLoading] = useState(true);
  const { actions } = useUnifiedStore();

  // Mock data - in real app, this would come from PrizePicks API
  useEffect(() => {
    const loadProjections = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const mockProjections: PlayerProjection[] = [
          {
            id: "1",
            playerName: "LeBron James",
            team: "LAL",
            position: "SF",
            statType: "Points",
            line: 25.5,
            over: 1.9,
            under: 1.9,
            confidence: 0.78,
            trend: "up",
            recent: [28, 31, 22, 29, 26],
          },
          {
            id: "2",
            playerName: "Stephen Curry",
            team: "GSW",
            position: "PG",
            statType: "Points",
            line: 27.5,
            over: 1.85,
            under: 1.95,
            confidence: 0.82,
            trend: "up",
            recent: [30, 25, 33, 28, 31],
          },
          {
            id: "3",
            playerName: "Giannis Antetokounmpo",
            team: "MIL",
            position: "PF",
            statType: "Rebounds",
            line: 11.5,
            over: 1.92,
            under: 1.88,
            confidence: 0.73,
            trend: "stable",
            recent: [12, 14, 9, 13, 11],
          },
          {
            id: "4",
            playerName: "Luka Dončić",
            team: "DAL",
            position: "PG",
            statType: "Assists",
            line: 8.5,
            over: 1.88,
            under: 1.92,
            confidence: 0.85,
            trend: "up",
            recent: [10, 11, 7, 9, 12],
          },
          {
            id: "5",
            playerName: "Joel Embiid",
            team: "PHI",
            position: "C",
            statType: "Points",
            line: 30.5,
            over: 1.95,
            under: 1.85,
            confidence: 0.69,
            trend: "down",
            recent: [28, 25, 33, 27, 31],
          },
        ];

        setProjections(mockProjections);
        setFilteredProjections(mockProjections);

        actions.addToast({
          type: "success",
          title: "Projections Loaded",
          message: `${mockProjections.length} player projections loaded`,
          duration: 3000,
        });
      } catch (error) {
        actions.addToast({
          type: "error",
          title: "Load Failed",
          message: "Failed to load PrizePicks projections",
          duration: 5000,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProjections();
  }, [actions]);

  // Filter projections based on search and filters
  useEffect(() => {
    let filtered = projections.filter((proj) => {
      const matchesSearch =
        proj.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        proj.team.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPosition =
        selectedPosition === "all" || proj.position === selectedPosition;
      const matchesConfidence = proj.confidence >= minConfidence;

      return matchesSearch && matchesPosition && matchesConfidence;
    });

    setFilteredProjections(filtered);
  }, [projections, searchTerm, selectedPosition, minConfidence]);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600 bg-green-100";
    if (confidence >= 0.7) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const calculateAverage = (values: number[]) => {
    return values.reduce((a, b) => a + b, 0) / values.length;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            PrizePicks Enhanced
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            AI-powered player prop analysis with ML predictions
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search players..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Position Filter */}
            <div>
              <select
                value={selectedPosition}
                onChange={(e) => setSelectedPosition(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Positions</option>
                <option value="PG">Point Guard</option>
                <option value="SG">Shooting Guard</option>
                <option value="SF">Small Forward</option>
                <option value="PF">Power Forward</option>
                <option value="C">Center</option>
              </select>
            </div>

            {/* Confidence Filter */}
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Min Confidence: {(minConfidence * 100).toFixed(0)}%
              </label>
              <input
                type="range"
                min="0.5"
                max="1"
                step="0.05"
                value={minConfidence}
                onChange={(e) => setMinConfidence(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Refresh */}
            <div className="flex items-end">
              <button
                onClick={() => window.location.reload()}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">
              Loading projections...
            </p>
          </div>
        )}

        {/* Projections Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjections.map((projection) => (
              <div
                key={projection.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-gray-900 dark:text-white">
                      {projection.playerName}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>{projection.team}</span>
                      <span>•</span>
                      <span>{projection.position}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(projection.trend)}
                    <Star className="w-4 h-4 text-yellow-500" />
                  </div>
                </div>

                {/* Stat Info */}
                <div className="text-center mb-4">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {projection.line}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {projection.statType}
                  </div>
                </div>

                {/* Odds */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Over
                    </div>
                    <div className="font-semibold text-green-600">
                      {projection.over}
                    </div>
                  </div>
                  <div className="text-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      Under
                    </div>
                    <div className="font-semibold text-red-600">
                      {projection.under}
                    </div>
                  </div>
                </div>

                {/* Recent Performance */}
                <div className="mb-4">
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Last 5 Games (Avg:{" "}
                    {calculateAverage(projection.recent).toFixed(1)})
                  </div>
                  <div className="flex space-x-1">
                    {projection.recent.map((value, index) => (
                      <div
                        key={index}
                        className={`flex-1 h-8 rounded flex items-center justify-center text-xs font-medium ${
                          value > projection.line
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {value}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Confidence */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    ML Confidence
                  </span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(projection.confidence)}`}
                  >
                    {(projection.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredProjections.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No projections found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your filters or search terms
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrizePicksPageEnhanced;
