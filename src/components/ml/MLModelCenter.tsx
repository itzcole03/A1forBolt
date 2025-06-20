import React, { useState, useEffect } from "react";
import {
  Brain,
  Play,
  Pause,
  Settings,
  TrendingUp,
  Target,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  Download,
  RefreshCw,
  BarChart3,
  Activity,
} from "lucide-react";
import { mlEngine } from "../../services/ml/UnifiedMLEngine";
import { useUnifiedStore } from "../../store/unified/UnifiedStoreManager";
import type {
  MLModelConfig,
  ModelPerformanceMetrics,
} from "../../services/ml/UnifiedMLEngine";

interface ModelStatus {
  model: MLModelConfig;
  performance: ModelPerformanceMetrics | null;
  isRetraining: boolean;
  lastUpdate: Date;
  health: "healthy" | "warning" | "error";
}

const MLModelCenter: React.FC = () => {
  const [modelStatuses, setModelStatuses] = useState<ModelStatus[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  const [isRetrainingAll, setIsRetrainingAll] = useState(false);
  const [systemHealth, setSystemHealth] = useState<
    "healthy" | "warning" | "error"
  >("healthy");

  const { actions } = useUnifiedStore();

  useEffect(() => {
    const loadModelStatuses = async () => {
      try {
        const activeModels = mlEngine.getActiveModels();
        const statuses: ModelStatus[] = await Promise.all(
          activeModels.map(async (model) => {
            const performance = mlEngine.getModelPerformance(model.name);
            return {
              model,
              performance: performance || null,
              isRetraining: false,
              lastUpdate: new Date(model.lastTrained),
              health:
                performance?.accuracy && performance.accuracy > 0.7
                  ? "healthy"
                  : performance?.accuracy && performance.accuracy > 0.6
                    ? "warning"
                    : "error",
            };
          }),
        );

        setModelStatuses(statuses);

        // Calculate system health
        const healthyModels = statuses.filter(
          (s) => s.health === "healthy",
        ).length;
        const totalModels = statuses.length;

        if (healthyModels / totalModels >= 0.8) {
          setSystemHealth("healthy");
        } else if (healthyModels / totalModels >= 0.6) {
          setSystemHealth("warning");
        } else {
          setSystemHealth("error");
        }
      } catch (error) {
        console.error("Failed to load model statuses:", error);
        actions.addToast({
          type: "error",
          title: "Model Loading Failed",
          message: "Unable to load ML model statuses",
        });
      }
    };

    loadModelStatuses();
    const interval = setInterval(loadModelStatuses, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [actions]);

  const handleRetrain = async (modelName: string) => {
    setModelStatuses((prev) =>
      prev.map((status) =>
        status.model.name === modelName
          ? { ...status, isRetraining: true }
          : status,
      ),
    );

    try {
      await mlEngine.retrain(modelName);

      actions.addToast({
        type: "success",
        title: "Retraining Complete",
        message: `Model ${modelName} has been successfully retrained`,
      });

      // Reload model status
      const updatedModel = mlEngine
        .getActiveModels()
        .find((m) => m.name === modelName);
      if (updatedModel) {
        setModelStatuses((prev) =>
          prev.map((status) =>
            status.model.name === modelName
              ? {
                  ...status,
                  model: updatedModel,
                  isRetraining: false,
                  lastUpdate: new Date(),
                  health: "healthy",
                }
              : status,
          ),
        );
      }
    } catch (error) {
      actions.addToast({
        type: "error",
        title: "Retraining Failed",
        message: `Failed to retrain model ${modelName}`,
      });

      setModelStatuses((prev) =>
        prev.map((status) =>
          status.model.name === modelName
            ? { ...status, isRetraining: false }
            : status,
        ),
      );
    }
  };

  const handleRetrainAll = async () => {
    setIsRetrainingAll(true);
    setModelStatuses((prev) =>
      prev.map((status) => ({ ...status, isRetraining: true })),
    );

    try {
      await mlEngine.retrain(); // Retrain all models

      actions.addToast({
        type: "success",
        title: "All Models Retrained",
        message: "All ML models have been successfully retrained",
      });

      // Reload all model statuses
      const activeModels = mlEngine.getActiveModels();
      setModelStatuses((prev) =>
        prev.map((status, index) => ({
          ...status,
          model: activeModels[index] || status.model,
          isRetraining: false,
          lastUpdate: new Date(),
          health: "healthy",
        })),
      );
    } catch (error) {
      actions.addToast({
        type: "error",
        title: "Bulk Retraining Failed",
        message: "Failed to retrain all models",
      });

      setModelStatuses((prev) =>
        prev.map((status) => ({ ...status, isRetraining: false })),
      );
    } finally {
      setIsRetrainingAll(false);
    }
  };

  const toggleModelStatus = (modelName: string) => {
    setModelStatuses((prev) =>
      prev.map((status) =>
        status.model.name === modelName
          ? {
              ...status,
              model: { ...status.model, isActive: !status.model.isActive },
            }
          : status,
      ),
    );

    actions.addToast({
      type: "info",
      title: "Model Status Updated",
      message: `Model ${modelName} ${modelStatuses.find((s) => s.model.name === modelName)?.model.isActive ? "deactivated" : "activated"}`,
    });
  };

  const getHealthColor = (health: string) => {
    switch (health) {
      case "healthy":
        return "text-green-600 bg-green-100";
      case "warning":
        return "text-yellow-600 bg-yellow-100";
      case "error":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case "healthy":
        return <CheckCircle className="w-4 h-4" />;
      case "warning":
        return <AlertCircle className="w-4 h-4" />;
      case "error":
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const ModelCard: React.FC<{ status: ModelStatus }> = ({ status }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
            <Brain className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {status.model.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {status.model.type.toUpperCase()} • v{status.model.version}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getHealthColor(status.health)}`}
          >
            {getHealthIcon(status.health)}
            <span className="ml-1">{status.health.toUpperCase()}</span>
          </span>

          <button
            onClick={() => toggleModelStatus(status.model.name)}
            disabled={status.isRetraining}
            className={`p-2 rounded-lg transition-colors ${
              status.model.isActive
                ? "bg-green-100 text-green-600 hover:bg-green-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
            title={
              status.model.isActive ? "Deactivate Model" : "Activate Model"
            }
          >
            {status.model.isActive ? (
              <Play className="w-4 h-4" />
            ) : (
              <Pause className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Performance Metrics */}
      {status.performance && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {(status.performance.accuracy * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Accuracy
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {(status.performance.precision * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Precision
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-gray-900 dark:text-white">
              {status.performance.totalPredictions}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Predictions
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {(status.performance.profitability * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400">
              Profit
            </div>
          </div>
        </div>
      )}

      {/* Model Weight */}
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600 dark:text-gray-400">
            Ensemble Weight
          </span>
          <span className="font-medium text-gray-900 dark:text-white">
            {(status.model.weight * 100).toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${status.model.weight * 100}%` }}
          />
        </div>
      </div>

      {/* Last Update */}
      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-4">
        <div className="flex items-center space-x-1">
          <Clock className="w-4 h-4" />
          <span>Last trained: {status.lastUpdate.toLocaleDateString()}</span>
        </div>
        <span>{status.model.features.length} features</span>
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <button
          onClick={() => handleRetrain(status.model.name)}
          disabled={status.isRetraining || isRetrainingAll}
          className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
        >
          {status.isRetraining ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              <span>Training...</span>
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              <span>Retrain</span>
            </>
          )}
        </button>

        <button
          onClick={() => setSelectedModel(status.model.name)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>

        <button
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          title="Download Model"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            ML Model Center
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and monitor your machine learning models
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getHealthColor(systemHealth)}`}
          >
            {getHealthIcon(systemHealth)}
            <span className="ml-1">System {systemHealth.toUpperCase()}</span>
          </div>

          <button
            onClick={handleRetrainAll}
            disabled={isRetrainingAll}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            {isRetrainingAll ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                <span>Retraining All...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Retrain All</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <Brain className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {modelStatuses.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Models
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {modelStatuses.filter((s) => s.model.isActive).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Active Models
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {modelStatuses.length > 0
                  ? (
                      (modelStatuses.reduce(
                        (acc, s) => acc + (s.performance?.accuracy || 0),
                        0,
                      ) /
                        modelStatuses.length) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Avg Accuracy
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
              <Target className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {modelStatuses.reduce(
                  (acc, s) => acc + (s.performance?.totalPredictions || 0),
                  0,
                )}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Total Predictions
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Model Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {modelStatuses.map((status, index) => (
          <ModelCard key={index} status={status} />
        ))}
      </div>

      {/* Model Details Modal */}
      {selectedModel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Model Details: {selectedModel}
              </h3>
              <button
                onClick={() => setSelectedModel(null)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Model Configuration */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Configuration
                </h4>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {JSON.stringify(
                      modelStatuses.find((s) => s.model.name === selectedModel)
                        ?.model.hyperparameters,
                      null,
                      2,
                    )}
                  </pre>
                </div>
              </div>

              {/* Performance Metrics */}
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Performance Metrics
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {Object.entries(
                    modelStatuses.find((s) => s.model.name === selectedModel)
                      ?.model.performance || {},
                  ).map(([key, value]) => (
                    <div
                      key={key}
                      className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3"
                    >
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase())}
                      </div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        {typeof value === "number" ? value.toFixed(3) : value}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MLModelCenter;
