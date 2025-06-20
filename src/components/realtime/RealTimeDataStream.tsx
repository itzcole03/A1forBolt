import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRealtimeData } from "../../hooks/useRealtimeData";
import { useUnifiedAnalytics } from "../../hooks/useUnifiedAnalytics";
import { RealTimeMoneyMakingService } from "../../services/RealTimeMoneyMakingService";

interface StreamData {
  timestamp: number;
  type:
    | "odds"
    | "injury"
    | "lineup"
    | "weather"
    | "market"
    | "prediction"
    | "arbitrage";
  source: string;
  data: any;
  impact: "high" | "medium" | "low";
  processed: boolean;
}

interface ConnectionMetrics {
  latency: number;
  messagesPerSecond: number;
  connectionUptime: number;
  totalMessages: number;
  errors: number;
}

interface FilterSettings {
  types: Set<string>;
  sources: Set<string>;
  minImpact: "low" | "medium" | "high";
  maxMessages: number;
}

const RealTimeDataStream: React.FC = () => {
  const [streamData, setStreamData] = useState<StreamData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [metrics, setMetrics] = useState<ConnectionMetrics>({
    latency: 0,
    messagesPerSecond: 0,
    connectionUptime: 0,
    totalMessages: 0,
    errors: 0,
  });
  const [filters, setFilters] = useState<FilterSettings>({
    types: new Set(["odds", "injury", "arbitrage", "prediction"]),
    sources: new Set(["prizepicks", "sportsradar", "internal"]),
    minImpact: "low",
    maxMessages: 100,
  });
  const [autoScroll, setAutoScroll] = useState(true);
  const [selectedItem, setSelectedItem] = useState<StreamData | null>(null);

  const { realtime } = useUnifiedAnalytics({ realtime: true });

  // Real-time WebSocket connection
  const { data, isConnected: wsConnected } = useRealtimeData<any>({
    url: "ws://localhost:8080/realtime",
    onMessage: useCallback(
      (message: any) => {
        const newData: StreamData = {
          timestamp: Date.now(),
          type: message.type || "market",
          source: message.source || "unknown",
          data: message.data || message,
          impact: message.impact || "medium",
          processed: false,
        };

        setStreamData((prev) => {
          const updated = [newData, ...prev].slice(0, filters.maxMessages);
          return updated;
        });

        setMetrics((prev) => ({
          ...prev,
          totalMessages: prev.totalMessages + 1,
          messagesPerSecond: prev.messagesPerSecond + 0.1, // Approximate
        }));
      },
      [filters.maxMessages],
    ),
    onConnect: useCallback(() => {
      setIsConnected(true);
      setMetrics((prev) => ({ ...prev, connectionUptime: Date.now() }));
    }, []),
    onDisconnect: useCallback(() => {
      setIsConnected(false);
    }, []),
    onError: useCallback(() => {
      setMetrics((prev) => ({ ...prev, errors: prev.errors + 1 }));
    }, []),
  });

  // Simulated real-time data generator for development
  useEffect(() => {
    if (!wsConnected) {
      const interval = setInterval(
        () => {
          const mockData = generateMockStreamData();
          const newData: StreamData = {
            timestamp: Date.now(),
            type: mockData.type,
            source: mockData.source,
            data: mockData.data,
            impact: mockData.impact,
            processed: false,
          };

          setStreamData((prev) => {
            const updated = [newData, ...prev].slice(0, filters.maxMessages);
            return updated;
          });

          setMetrics((prev) => ({
            ...prev,
            totalMessages: prev.totalMessages + 1,
            latency: Math.random() * 50 + 10, // Simulate latency 10-60ms
          }));
        },
        2000 + Math.random() * 3000,
      ); // Random interval 2-5 seconds

      return () => clearInterval(interval);
    }
  }, [wsConnected, filters.maxMessages]);

  const generateMockStreamData = () => {
    const types = [
      "odds",
      "injury",
      "lineup",
      "weather",
      "market",
      "prediction",
      "arbitrage",
    ];
    const sources = [
      "prizepicks",
      "sportsradar",
      "espn",
      "internal",
      "external",
    ];
    const impacts = ["high", "medium", "low"];

    const type = types[Math.floor(Math.random() * types.length)];
    const source = sources[Math.floor(Math.random() * sources.length)];
    const impact = impacts[Math.floor(Math.random() * impacts.length)];

    const mockDataMap = {
      odds: {
        playerId: "player_123",
        propType: "points",
        oldOdds: -110,
        newOdds: -105,
        change: 5,
        bookmaker: "DraftKings",
      },
      injury: {
        playerId: "player_456",
        playerName: "LeBron James",
        severity: "questionable",
        bodyPart: "ankle",
        gameImpact: "probable",
      },
      arbitrage: {
        opportunity: {
          profit: 3.2,
          investment: 100,
          books: ["FanDuel", "BetMGM"],
          odds: [+150, -140],
        },
      },
      prediction: {
        predictionId: "pred_789",
        confidence: 0.78,
        value: 23.5,
        change: 1.2,
      },
      market: {
        sentiment: "bullish",
        volume: "high",
        priceMovement: "+2.3%",
      },
    };

    return {
      type,
      source,
      impact,
      data: mockDataMap[type as keyof typeof mockDataMap] || {
        raw: "Unknown data type",
      },
    };
  };

  // Filtered data based on current filters
  const filteredData = useMemo(() => {
    return streamData.filter((item) => {
      if (!filters.types.has(item.type)) return false;
      if (!filters.sources.has(item.source)) return false;

      const impactLevel = { low: 1, medium: 2, high: 3 };
      const minLevel = impactLevel[filters.minImpact];
      const itemLevel = impactLevel[item.impact];

      return itemLevel >= minLevel;
    });
  }, [streamData, filters]);

  const toggleFilter = useCallback(
    (category: "types" | "sources", value: string) => {
      setFilters((prev) => {
        const newSet = new Set(prev[category]);
        if (newSet.has(value)) {
          newSet.delete(value);
        } else {
          newSet.add(value);
        }
        return { ...prev, [category]: newSet };
      });
    },
    [],
  );

  const clearStream = useCallback(() => {
    setStreamData([]);
    setMetrics((prev) => ({ ...prev, totalMessages: 0, errors: 0 }));
  }, []);

  const exportStream = useCallback(() => {
    const exportData = {
      timestamp: new Date().toISOString(),
      metrics,
      filters: {
        ...filters,
        types: Array.from(filters.types),
        sources: Array.from(filters.sources),
      },
      data: filteredData,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `realtime-stream-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [metrics, filters, filteredData]);

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400";
      case "medium":
        return "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400";
      case "low":
        return "text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/20 dark:text-gray-400";
    }
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      odds: "📊",
      injury: "🏥",
      lineup: "👥",
      weather: "🌤️",
      market: "📈",
      prediction: "🔮",
      arbitrage: "⚖️",
    };
    return icons[type as keyof typeof icons] || "📡";
  };

  return (
    <div className="realtime-stream max-w-7xl mx-auto p-6 space-y-6">
      {/* Header with Connection Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              ⚡ Real-Time Data Stream
            </h1>
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
              ></div>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setAutoScroll(!autoScroll)}
              className={`px-3 py-1 text-sm rounded ${
                autoScroll
                  ? "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400"
                  : "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
              }`}
            >
              Auto-scroll: {autoScroll ? "ON" : "OFF"}
            </button>
            <button
              onClick={exportStream}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Export
            </button>
            <button
              onClick={clearStream}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {metrics.latency.toFixed(0)}ms
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Latency
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {metrics.totalMessages}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Messages
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {metrics.messagesPerSecond.toFixed(1)}/s
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Rate</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {Math.floor((Date.now() - metrics.connectionUptime) / 1000)}s
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Uptime
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {metrics.errors}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Errors
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Filters
        </h2>

        <div className="space-y-4">
          {/* Type Filters */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Data Types
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                "odds",
                "injury",
                "lineup",
                "weather",
                "market",
                "prediction",
                "arbitrage",
              ].map((type) => (
                <button
                  key={type}
                  onClick={() => toggleFilter("types", type)}
                  className={`px-3 py-1 text-sm rounded-full ${
                    filters.types.has(type)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {getTypeIcon(type)} {type}
                </button>
              ))}
            </div>
          </div>

          {/* Source Filters */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Sources
            </h3>
            <div className="flex flex-wrap gap-2">
              {[
                "prizepicks",
                "sportsradar",
                "espn",
                "internal",
                "external",
              ].map((source) => (
                <button
                  key={source}
                  onClick={() => toggleFilter("sources", source)}
                  className={`px-3 py-1 text-sm rounded-full ${
                    filters.sources.has(source)
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  {source}
                </button>
              ))}
            </div>
          </div>

          {/* Impact Filter */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Minimum Impact
            </h3>
            <select
              value={filters.minImpact}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  minImpact: e.target.value as "low" | "medium" | "high",
                }))
              }
              className="px-3 py-1 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stream Data */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Live Stream ({filteredData.length} messages)
          </h2>
        </div>

        <div
          className="max-h-96 overflow-y-auto"
          style={{ scrollBehavior: autoScroll ? "smooth" : "auto" }}
        >
          {filteredData.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4">📡</div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Waiting for Data...
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Real-time data will appear here as it streams in.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredData.map((item, index) => (
                <div
                  key={`${item.timestamp}-${index}`}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getTypeIcon(item.type)}</span>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {item.type.charAt(0).toUpperCase() +
                              item.type.slice(1)}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full ${getImpactColor(item.impact)}`}
                          >
                            {item.impact}
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          From {item.source} • {formatTimestamp(item.timestamp)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {typeof item.data === "object"
                          ? Object.keys(item.data).length + " fields"
                          : String(item.data)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Data Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {getTypeIcon(selectedItem.type)}{" "}
                  {selectedItem.type.charAt(0).toUpperCase() +
                    selectedItem.type.slice(1)}{" "}
                  Data
                </h3>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Source:
                  </span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    {selectedItem.source}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Timestamp:
                  </span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    {new Date(selectedItem.timestamp).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Impact:
                  </span>
                  <span
                    className={`ml-2 px-2 py-1 text-xs rounded-full ${getImpactColor(selectedItem.impact)}`}
                  >
                    {selectedItem.impact}
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700 dark:text-gray-300">
                    Data:
                  </span>
                  <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded text-sm overflow-x-auto">
                    {JSON.stringify(selectedItem.data, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RealTimeDataStream;
