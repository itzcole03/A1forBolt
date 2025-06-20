import React, { useEffect, useState } from "react";
import { useUnifiedStore } from "../store/unified/UnifiedStoreManager";
import { dataPipeline } from "../services/data/UnifiedDataPipeline";
import { mlEngine } from "../services/ml/UnifiedMLEngine";

interface AppInitializerProps {
  children: React.ReactNode;
}

export const AppInitializer: React.FC<AppInitializerProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { actions } = useUnifiedStore();

  useEffect(() => {
    let isMounted = true;

    const initializeApp = async () => {
      try {
        actions.setLoading("app_init", true);

        // Initialize data connections
        console.log("🚀 Initializing A1Betting systems...");

        // Check data pipeline status
        const connectionStatus = dataPipeline.getConnectionStatus();
        console.log("📡 Data connections:", connectionStatus);

        // Initialize ML engine
        const activeModels = mlEngine.getActiveModels();
        console.log("🧠 Active ML models:", activeModels.length);

        if (isMounted) {
          setIsInitialized(true);
          actions.setLoading("app_init", false);
          actions.addToast({
            type: "success",
            title: "System Ready",
            message: `A1Betting initialized with ${activeModels.length} active models`,
            duration: 3000,
          });
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown initialization error";
        console.error("❌ App initialization failed:", errorMessage);

        if (isMounted) {
          setError(errorMessage);
          actions.setLoading("app_init", false);
          actions.addToast({
            type: "error",
            title: "Initialization Error",
            message: errorMessage,
            duration: 5000,
          });
        }
      }
    };

    initializeApp();

    return () => {
      isMounted = false;
    };
  }, [actions]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="max-w-md mx-auto text-center p-6">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Initialization Failed
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Initializing A1Betting
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Setting up your elite sports intelligence platform...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AppInitializer;
