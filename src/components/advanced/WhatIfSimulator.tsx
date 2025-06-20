import React, { useState, useCallback, useMemo } from "react";
import { useUnifiedAnalytics } from "../../hooks/useUnifiedAnalytics";
import { UnifiedPredictionEngine } from "../../core/UnifiedPredictionEngine";

interface ScenarioInput {
  id: string;
  name: string;
  type:
    | "odds_change"
    | "injury"
    | "weather"
    | "lineup_change"
    | "market_shift"
    | "custom";
  parameters: Record<string, number | string | boolean>;
  impact: number; // -1 to 1
}

interface SimulationResult {
  scenarioId: string;
  originalPrediction: number;
  adjustedPrediction: number;
  impact: number;
  confidence: number;
  riskLevel: "low" | "medium" | "high";
  explanation: string;
  factors: Array<{
    name: string;
    originalValue: number;
    adjustedValue: number;
    contribution: number;
  }>;
}

interface WhatIfSimulatorProps {
  eventId?: string;
  playerId?: string;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({
  eventId = "sample-event",
  playerId = "sample-player",
}) => {
  const [scenarios, setScenarios] = useState<ScenarioInput[]>([]);
  const [simulationResults, setSimulationResults] = useState<
    SimulationResult[]
  >([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);

  const { ml, betting } = useUnifiedAnalytics({
    ml: { autoUpdate: true },
    betting: true,
  });

  // Predefined scenario templates
  const scenarioTemplates = useMemo(
    () => [
      {
        id: "odds_increase",
        name: "Odds Increase (+20%)",
        type: "odds_change" as const,
        parameters: { oddsMultiplier: 1.2 },
        impact: 0.15,
      },
      {
        id: "key_injury",
        name: "Key Player Injury",
        type: "injury" as const,
        parameters: { injuredPlayer: "star", severity: "high" },
        impact: -0.3,
      },
      {
        id: "weather_change",
        name: "Weather Impact (Rain)",
        type: "weather" as const,
        parameters: { condition: "rain", windSpeed: 15 },
        impact: -0.1,
      },
      {
        id: "lineup_change",
        name: "Lineup Change",
        type: "lineup_change" as const,
        parameters: { changedPositions: 2, quality: "upgrade" },
        impact: 0.08,
      },
      {
        id: "market_shift",
        name: "Market Sentiment Shift",
        type: "market_shift" as const,
        parameters: { sentimentChange: -0.2, volume: "high" },
        impact: -0.12,
      },
    ],
    [],
  );

  const addScenario = useCallback((template: (typeof scenarioTemplates)[0]) => {
    const newScenario: ScenarioInput = {
      ...template,
      id: `${template.id}_${Date.now()}`,
    };
    setScenarios((prev) => [...prev, newScenario]);
  }, []);

  const removeScenario = useCallback((scenarioId: string) => {
    setScenarios((prev) => prev.filter((s) => s.id !== scenarioId));
    setSimulationResults((prev) =>
      prev.filter((r) => r.scenarioId !== scenarioId),
    );
  }, []);

  const simulateScenario = useCallback(async (scenario: ScenarioInput) => {
    setIsSimulating(true);
    setActiveScenario(scenario.id);

    try {
      // Simulate prediction adjustment based on scenario
      const baselinePrediction = 0.65; // Mock baseline
      const adjustmentFactor = scenario.impact * 0.5; // Dampen impact
      const adjustedPrediction = Math.max(
        0.05,
        Math.min(0.95, baselinePrediction + adjustmentFactor),
      );

      const confidence = Math.max(0.3, 0.9 - Math.abs(adjustmentFactor));
      const riskLevel =
        Math.abs(adjustmentFactor) > 0.15
          ? "high"
          : Math.abs(adjustmentFactor) > 0.08
            ? "medium"
            : "low";

      // Generate factor breakdown
      const factors = [
        {
          name: "Historical Performance",
          originalValue: 0.2,
          adjustedValue: 0.2 + (scenario.type === "injury" ? -0.05 : 0),
          contribution: scenario.type === "injury" ? -0.05 : 0,
        },
        {
          name: "Market Conditions",
          originalValue: 0.15,
          adjustedValue: 0.15 + (scenario.type === "odds_change" ? 0.03 : 0),
          contribution: scenario.type === "odds_change" ? 0.03 : 0,
        },
        {
          name: "Environmental Factors",
          originalValue: 0.1,
          adjustedValue: 0.1 + (scenario.type === "weather" ? -0.03 : 0),
          contribution: scenario.type === "weather" ? -0.03 : 0,
        },
        {
          name: "Team Dynamics",
          originalValue: 0.12,
          adjustedValue: 0.12 + (scenario.type === "lineup_change" ? 0.02 : 0),
          contribution: scenario.type === "lineup_change" ? 0.02 : 0,
        },
      ];

      const result: SimulationResult = {
        scenarioId: scenario.id,
        originalPrediction: baselinePrediction,
        adjustedPrediction,
        impact: adjustedPrediction - baselinePrediction,
        confidence,
        riskLevel,
        explanation: generateExplanation(
          scenario,
          adjustedPrediction - baselinePrediction,
        ),
        factors,
      };

      setSimulationResults((prev) => [
        ...prev.filter((r) => r.scenarioId !== scenario.id),
        result,
      ]);
    } catch (error) {
      console.error("Simulation error:", error);
    } finally {
      setIsSimulating(false);
      setActiveScenario(null);
    }
  }, []);

  const generateExplanation = (
    scenario: ScenarioInput,
    impact: number,
  ): string => {
    const direction = impact > 0 ? "increases" : "decreases";
    const magnitude = Math.abs(impact) > 0.1 ? "significantly" : "moderately";

    switch (scenario.type) {
      case "odds_change":
        return `Odds adjustment ${magnitude} ${direction} prediction confidence due to market perception shifts.`;
      case "injury":
        return `Key player injury ${magnitude} ${direction} team performance expectations and prop outcomes.`;
      case "weather":
        return `Weather conditions ${magnitude} ${direction} game dynamics and player performance metrics.`;
      case "lineup_change":
        return `Lineup modifications ${magnitude} ${direction} team synergy and individual player opportunities.`;
      case "market_shift":
        return `Market sentiment changes ${magnitude} ${direction} betting value and prediction accuracy.`;
      default:
        return `Custom scenario ${magnitude} ${direction} overall prediction model outputs.`;
    }
  };

  const runAllScenarios = useCallback(async () => {
    for (const scenario of scenarios) {
      await simulateScenario(scenario);
      // Small delay to show progression
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  }, [scenarios, simulateScenario]);

  const clearAll = useCallback(() => {
    setScenarios([]);
    setSimulationResults([]);
  }, []);

  const exportResults = useCallback(() => {
    const data = {
      eventId,
      playerId,
      timestamp: new Date().toISOString(),
      scenarios,
      results: simulationResults,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `what-if-simulation-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [eventId, playerId, scenarios, simulationResults]);

  return (
    <div className="what-if-simulator max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              🔬 What-If Scenario Simulator
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Test different scenarios and see their impact on predictions
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={runAllScenarios}
              disabled={scenarios.length === 0 || isSimulating}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSimulating ? "Simulating..." : "Run All Scenarios"}
            </button>
            <button
              onClick={exportResults}
              disabled={simulationResults.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Export Results
            </button>
            <button
              onClick={clearAll}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Scenario Templates */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Add Scenarios
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {scenarioTemplates.map((template) => (
            <button
              key={template.id}
              onClick={() => addScenario(template)}
              className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <div className="text-left">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {template.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Expected impact: {template.impact > 0 ? "+" : ""}
                  {(template.impact * 100).toFixed(1)}%
                </p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Active Scenarios */}
      {scenarios.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Active Scenarios ({scenarios.length})
          </h2>
          <div className="space-y-3">
            {scenarios.map((scenario) => {
              const result = simulationResults.find(
                (r) => r.scenarioId === scenario.id,
              );
              return (
                <div
                  key={scenario.id}
                  className={`p-4 border rounded-lg ${
                    activeScenario === scenario.id
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-300 dark:border-gray-600"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {scenario.name}
                      </h3>
                      {result && (
                        <div className="mt-2 space-y-2">
                          <div className="flex items-center space-x-4 text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                              Impact:{" "}
                              <span
                                className={
                                  result.impact > 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              >
                                {result.impact > 0 ? "+" : ""}
                                {(result.impact * 100).toFixed(1)}%
                              </span>
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                              Confidence: {(result.confidence * 100).toFixed(1)}
                              %
                            </span>
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                result.riskLevel === "high"
                                  ? "bg-red-100 text-red-800"
                                  : result.riskLevel === "medium"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800"
                              }`}
                            >
                              {result.riskLevel} risk
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {result.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <button
                        onClick={() => simulateScenario(scenario)}
                        disabled={isSimulating}
                        className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50"
                      >
                        {activeScenario === scenario.id
                          ? "Running..."
                          : "Simulate"}
                      </button>
                      <button
                        onClick={() => removeScenario(scenario.id)}
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Results Comparison */}
      {simulationResults.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Simulation Results Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Scenario
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Original
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Adjusted
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Impact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Risk Level
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {simulationResults.map((result) => {
                  const scenario = scenarios.find(
                    (s) => s.id === result.scenarioId,
                  );
                  return (
                    <tr key={result.scenarioId}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {scenario?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {(result.originalPrediction * 100).toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                        {(result.adjustedPrediction * 100).toFixed(1)}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span
                          className={
                            result.impact > 0
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {result.impact > 0 ? "+" : ""}
                          {(result.impact * 100).toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            result.riskLevel === "high"
                              ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                              : result.riskLevel === "medium"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400"
                                : "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                          }`}
                        >
                          {result.riskLevel}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {scenarios.length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">🔬</div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No Scenarios Added Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Add scenarios from the templates above to start simulating different
            conditions and their impact on predictions.
          </p>
        </div>
      )}
    </div>
  );
};

export default WhatIfSimulator;
