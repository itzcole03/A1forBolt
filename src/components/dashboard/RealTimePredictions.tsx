import { SportSelector } from "@/components/common/SportSelector";
import { EnhancedPrediction } from "@/services/realTimePredictionEngine";
import { useState } from "react";
import { getSportDisplayName } from "../../constants/sports";

interface RealTimePredictionsProps {
    predictions: EnhancedPrediction[];
    loading: boolean;
}

export function RealTimePredictions({
    predictions,
    loading,
}: RealTimePredictionsProps) {
    const [selectedSport, setSelectedSport] = useState("All");
    const [selectedType, setSelectedType] = useState("All");

    const types = ["All", "game", "player_prop"];

    const filteredPredictions = predictions.filter((pred) => {
        const sportMatch = selectedSport === "All" || pred.sport === selectedSport;
        const typeMatch = selectedType === "All" || pred.type === selectedType;
        return sportMatch && typeMatch;
    });

    const getValueGradeColor = (grade: string) => {
        const colors = {
            "A+": "text-green-600 bg-green-100 dark:bg-green-900/30",
            A: "text-green-500 bg-green-50 dark:bg-green-900/20",
            "B+": "text-blue-600 bg-blue-100 dark:bg-blue-900/30",
            B: "text-blue-500 bg-blue-50 dark:bg-blue-900/20",
            "C+": "text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30",
            C: "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20",
            D: "text-red-600 bg-red-100 dark:bg-red-900/30",
        };
        return colors[grade] || colors["C"];
    };

    const getRiskColor = (risk: number) => {
        if (risk < 0.2) return "text-green-600";
        if (risk < 0.4) return "text-yellow-600";
        return "text-red-600";
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 85) return "text-green-600";
        if (confidence >= 75) return "text-yellow-600";
        return "text-red-600";
    };

    if (loading) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center space-x-3 mb-6">
                    <span
                        role="img"
                        aria-label="target"
                        className="text-blue-600 text-2xl animate-spin"
                    >
                        🎯
                    </span>
                    <h3 className="text-xl font-bold dark:text-white">
                        Generating Real-Time Predictions...
                    </h3>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div
                            key={i}
                            className="bg-gray-200 dark:bg-gray-700 rounded-xl p-4 animate-pulse"
                        >
                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                            <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                            <div className="h-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (predictions.length === 0) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center space-x-3 mb-6">
                    <span role="img" aria-label="target" className="text-blue-600 text-2xl">
                        🎯
                    </span>
                    <h3 className="text-xl font-bold dark:text-white">
                        Real-Time Predictions
                    </h3>
                </div>
                <div className="text-center py-8">
                    <span
                        role="img"
                        aria-label="warning"
                        className="text-yellow-500 text-4xl mx-auto mb-4"
                    >
                        ⚠️
                    </span>
                    <h4 className="text-lg font-semibold text-gray-600 dark:text-gray-400 mb-2">
                        No Predictions Available
                    </h4>
                    <p className="text-gray-500 dark:text-gray-500">
                        Check your API connections and try refreshing the data
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <span role="img" aria-label="target" className="text-blue-600 text-2xl">
                        🎯
                    </span>
                    <h3 className="text-xl font-bold dark:text-white">
                        Real-Time Betting Predictions
                    </h3>
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="text-sm text-green-600 font-medium">Live Data</span>
                    </div>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    {filteredPredictions.length} predictions from real data
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-6">
                <SportSelector
                    selectedSport={selectedSport}
                    onSportChange={setSelectedSport}
                    label="Sport"
                />
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Type
                    </label>
                    <select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        title="Type"
                    >
                        {types.map((type) => (
                            <option key={type} value={type}>
                                {type === "All"
                                    ? "All Types"
                                    : type === "game"
                                        ? "Game Bets"
                                        : "Player Props"}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Predictions Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredPredictions.slice(0, 10).map((prediction) => (
                    <div
                        key={prediction.id}
                        className="p-6 border border-gray-200 dark:border-gray-700 rounded-xl hover:shadow-lg transition-shadow bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                                <span className="px-2 py-1 bg-blue-600 text-white rounded-full text-xs font-bold">
                                    {getSportDisplayName(prediction.sport)}
                                </span>
                                <span
                                    className={`px-2 py-1 rounded-full text-xs font-bold ${getValueGradeColor(
                                        prediction.valueGrade
                                    )}`}
                                >
                                    Grade: {prediction.valueGrade}
                                </span>
                                {prediction.valueGrade === "A+" && (
                                    <span role="img" aria-label="award" className="ml-1 text-xl">
                                        🏆
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center space-x-1">
                                <span role="img" aria-label="check" className="text-green-600 text-lg">
                                    ✅
                                </span>
                                <span className="text-xs text-green-600 font-medium">REAL DATA</span>
                            </div>
                        </div>

                        {/* Game/Pick Info */}
                        <div className="mb-4">
                            <h4 className="font-bold text-lg text-gray-900 dark:text-white mb-1">
                                {prediction.game}
                            </h4>
                            <p className="text-blue-600 dark:text-blue-400 font-semibold">
                                {prediction.pick}
                            </p>
                        </div>

                        {/* Key Metrics */}
                        <div className="grid grid-cols-3 gap-3 mb-4">
                            <div className="text-center p-2 bg-white/50 dark:bg-black/20 rounded-lg">
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                    Confidence
                                </div>
                                <div
                                    className={`text-lg font-bold ${getConfidenceColor(prediction.confidence)}`}
                                >
                                    {prediction.confidence}%
                                </div>
                            </div>
                            <div className="text-center p-2 bg-white/50 dark:bg-black/20 rounded-lg">
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                    Expected Value
                                </div>
                                <div
                                    className={`text-lg font-bold ${prediction.expectedValue > 0 ? "text-green-600" : "text-red-600"}`}
                                >
                                    {prediction.expectedValue > 0 ? "+" : ""}
                                    {(prediction.expectedValue * 100).toFixed(1)}%
                                </div>
                            </div>
                            <div className="text-center p-2 bg-white/50 dark:bg-black/20 rounded-lg">
                                <div className="text-xs text-gray-600 dark:text-gray-400">
                                    Risk Score
                                </div>
                                <div
                                    className={`text-lg font-bold ${getRiskColor(prediction.riskScore)}`}
                                >
                                    {(prediction.riskScore * 100).toFixed(0)}%
                                </div>
                            </div>
                        </div>

                        {/* Advanced Metrics */}
                        <div className="mb-4 p-3 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                                <span role="img" aria-label="brain" className="text-purple-600">
                                    🧠
                                </span>
                                <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">
                                    Advanced Analytics
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Model Consensus:
                                    </span>
                                    <div className="font-bold">
                                        {(prediction.modelConsensus * 100).toFixed(0)}%
                                    </div>
                                </div>
                                <div>
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Kelly Optimal:
                                    </span>
                                    <div className="font-bold">
                                        {(prediction.kellyOptimal * 100).toFixed(1)}%
                                    </div>
                                </div>
                                <div>
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Data Quality:
                                    </span>
                                    <div className="font-bold text-green-600">
                                        {(prediction.dataQuality * 100).toFixed(0)}%
                                    </div>
                                </div>
                                <div>
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Odds:
                                    </span>
                                    <div className="font-bold">
                                        {prediction.odds > 0 ? "+" : ""}
                                        {prediction.odds}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Backtest Results */}
                        <div className="mb-4 p-3 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                                <span role="img" aria-label="trending up" className="text-green-600">
                                    📈
                                </span>
                                <span className="text-sm font-semibold text-green-700 dark:text-green-300">
                                    Historical Performance
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Win Rate:
                                    </span>
                                    <div className="font-bold text-green-600">
                                        {(prediction.backtestResults.winRate * 100).toFixed(1)}%
                                    </div>
                                </div>
                                <div>
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Avg Return:
                                    </span>
                                    <div className="font-bold">
                                        {(prediction.backtestResults.avgReturn * 100).toFixed(1)}%
                                    </div>
                                </div>
                                <div>
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Max Drawdown:
                                    </span>
                                    <div className="font-bold text-red-600">
                                        {(prediction.backtestResults.maxDrawdown * 100).toFixed(1)}%
                                    </div>
                                </div>
                                <div>
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Profit Factor:
                                    </span>
                                    <div className="font-bold">
                                        {prediction.backtestResults.profitFactor.toFixed(2)}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Real-Time Factors */}
                        <div className="mb-4 p-3 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-lg">
                            <div className="flex items-center space-x-2 mb-2">
                                <span role="img" aria-label="shield" className="text-yellow-600">
                                    🛡️
                                </span>
                                <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">
                                    Live Market Factors
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Line Movement:
                                    </span>
                                    <div
                                        className={`font-bold ${prediction.realTimeFactors.lineMovement > 0 ? "text-green-600" : "text-red-600"}`}
                                    >
                                        {prediction.realTimeFactors.lineMovement > 0 ? "+" : ""}
                                        {prediction.realTimeFactors.lineMovement.toFixed(1)}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Public Betting:
                                    </span>
                                    <div className="font-bold">
                                        {(prediction.realTimeFactors.publicBetting * 100).toFixed(0)}%
                                    </div>
                                </div>
                                <div>
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Sharp Money:
                                    </span>
                                    <div
                                        className={`font-bold ${prediction.realTimeFactors.sharpMoney ? "text-green-600" : "text-gray-600"}`}
                                    >
                                        {prediction.realTimeFactors.sharpMoney ? "Yes" : "No"}
                                    </div>
                                </div>
                                <div>
                                    <span className="text-gray-600 dark:text-gray-400">
                                        Weather Impact:
                                    </span>
                                    <div className="font-bold">
                                        {(prediction.realTimeFactors.weatherImpact * 100).toFixed(0)}%
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Reasoning */}
                        <div className="mb-4">
                            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Key Reasoning:
                            </h5>
                            <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                {prediction.reasoning.slice(0, 3).map((reason, index) => (
                                    <li key={index} className="flex items-start space-x-1">
                                        <span className="text-blue-600">•</span>
                                        <span>{reason}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Data Sources */}
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                            <span className="font-medium">Sources:</span>{" "}
                            {prediction.sources.slice(0, 3).join(", ")}
                            {prediction.sources.length > 3 &&
                                ` +${prediction.sources.length - 3} more`}
                        </div>

                        {/* Timestamp */}
                        <div className="text-xs text-gray-400 mt-2">
                            Updated: {prediction.timestamp instanceof Date ? prediction.timestamp.toLocaleTimeString() : prediction.timestamp}
                        </div>
                    </div>
                ))}
            </div>

            {filteredPredictions.length === 0 && (
                <div className="text-center py-8">
                    <span
                        role="img"
                        aria-label="target"
                        className="text-gray-400 text-4xl mx-auto mb-4"
                    >
                        🎯
                    </span>
                    <p className="text-gray-500 dark:text-gray-400">
                        No predictions match the selected filters
                    </p>
                </div>
            )}
        </div>
    );
}
