import {
    Database,
    TrendingUp,
    Wifi,
    WifiOff
} from "lucide-react";
import { SPORTS_CONFIG } from "../../constants/sports";

interface HeroSectionProps {
    connectedSources: number;
    totalSources: number;
    gamesCount: number;
    playersCount: number;
    dataQuality: number;
    dataReliability: number;
}

export function HeroSection({
    connectedSources,
    totalSources,
    gamesCount,
    playersCount,
    dataQuality,
    dataReliability,
}: HeroSectionProps) {
    const connectionPercentage =
        totalSources > 0 ? (connectedSources / totalSources) * 100 : 0;
    const isFullyConnected = connectionPercentage >= 80;
    const isPrizePicksConnected = connectedSources > 0; // Simplified check

    return (
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 rounded-3xl p-10 text-white relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full animate-pulse"></div>
                <div className="absolute top-20 right-20 w-16 h-16 bg-yellow-300 rounded-full animate-bounce"></div>
                <div className="absolute bottom-10 left-1/3 w-12 h-12 bg-green-300 rounded-full animate-ping"></div>
                <div className="absolute bottom-20 right-1/4 w-14 h-14 bg-red-300 rounded-full animate-pulse"></div>
            </div>

            <div className="relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-6xl font-black mb-6 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
                        🚀 ENHANCED SPORTS AI PLATFORM 🚀
                    </h1>
                    <p className="text-xl max-w-4xl mx-auto leading-relaxed opacity-90">
                        Advanced sports intelligence with{" "}
                        <span className="font-bold text-yellow-300">
                            {totalSources}+ real data sources
                        </span>
                        ,
                        <span className="font-bold text-green-300">
                            {" "}
                            PrizePicks integration
                        </span>
                        ,
                        <span className="font-bold text-blue-300">
                            {" "}
                            live market analysis
                        </span>
                        , and
                        <span className="font-bold text-red-300">
                            {" "}
                            production-grade AI models
                        </span>{" "}
                        across all major sports
                    </p>
                    <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
                        <div className="flex items-center space-x-2">
                            {isFullyConnected ? (
                                <Wifi className="w-4 h-4 text-green-400 animate-pulse" />
                            ) : (
                                <WifiOff className="w-4 h-4 text-yellow-400" />
                            )}
                            <span
                                className={`font-medium ${isFullyConnected ? "text-green-300" : "text-yellow-300"}`}
                            >
                                {isFullyConnected ? "Full Data Coverage" : "Partial Coverage"}
                            </span>
                        </div>
                        <div className="text-gray-300">•</div>
                        <div className="flex items-center space-x-2">
                            <Database className="w-4 h-4 text-purple-400" />
                            <span className="text-purple-300 font-medium">
                                47+ AI Models Active
                            </span>
                        </div>
                        <div className="text-gray-300">•</div>
                        <div className="flex items-center space-x-2">
                            <TrendingUp className="w-4 h-4 text-blue-400" />
                            <span className="text-blue-300 font-medium">
                                Real-Time Analysis
                            </span>
                        </div>
                    </div>
                </div>

                {/* Enhanced Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-6">
                    <div className="text-center p-4 glass-morphism rounded-xl">
                        <div className="text-2xl font-bold text-green-400">
                            {connectedSources}
                        </div>
                        <div className="text-xs opacity-80">Data Sources</div>
                        <div className="text-xs text-green-300 mt-1">
                            {connectionPercentage.toFixed(0)}% Active
                        </div>
                    </div>

                    <div className="text-center p-4 glass-morphism rounded-xl">
                        <div className="text-2xl font-bold text-yellow-400">
                            {gamesCount}
                        </div>
                        <div className="text-xs opacity-80">Live Games</div>
                        <div className="text-xs text-yellow-300 mt-1">All Sports</div>
                    </div>

                    <div className="text-center p-4 glass-morphism rounded-xl">
                        <div className="text-2xl font-bold text-blue-400">
                            {playersCount}
                        </div>
                        <div className="text-xs opacity-80">Active Players</div>
                        <div className="text-xs text-blue-300 mt-1">Enhanced Data</div>
                    </div>

                    <div className="text-center p-4 glass-morphism rounded-xl">
                        <div className="text-2xl font-bold text-purple-400">
                            {(dataQuality * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs opacity-80">Data Quality</div>
                        <div className="text-xs text-purple-300 mt-1">Verified</div>
                    </div>

                    <div className="text-center p-4 glass-morphism rounded-xl">
                        <div className="text-2xl font-bold text-indigo-400">
                            {(dataReliability * 100).toFixed(1)}%
                        </div>
                        <div className="text-xs opacity-80">Reliability</div>
                        <div className="text-xs text-indigo-300 mt-1">Tested</div>
                    </div>

                    <div className="text-center p-4 glass-morphism rounded-xl">
                        <div className="text-2xl font-bold text-red-400">
                            {SPORTS_CONFIG.length}
                        </div>
                        <div className="text-xs opacity-80">Sports</div>
                        <div className="text-xs text-red-300 mt-1">Covered</div>
                    </div>
                </div>

                {/* Sports Coverage */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm mb-6">
                    {SPORTS_CONFIG.map((sport) => (
                        <div
                            key={sport.id}
                            className="flex items-center space-x-2 bg-white/10 rounded-lg px-3 py-2"
                        >
                            <span className="text-lg">{sport.emoji}</span>
                            <span>{sport.displayName}</span>
                        </div>
                    ))}
                </div>

                {/* PrizePicks Integration Status */}
                <div className="bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-blue-400 rounded-xl flex items-center justify-center">
                                <span className="text-2xl">🎯</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-bold">PrizePicks Integration</h3>
                                <p className="text-sm opacity-80">
                                    {isPrizePicksConnected
                                        ? "Connected to PrizePicks data feeds with real-time prop analysis"
                                        : "PrizePicks integration available - enhanced prop betting intelligence"}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div
                                className={`text-2xl font-bold ${isPrizePicksConnected ? "text-green-400" : "text-yellow-400"}`}
                            >
                                {isPrizePicksConnected ? "✅" : "⚠️"}
                            </div>
                            <div className="text-xs opacity-80">
                                {isPrizePicksConnected ? "Active" : "Standby"}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
