// EliteSportsHeader migrated from prototype Header
import React from 'react';
import { RefreshCw, Moon, Sun, Wifi, WifiOff } from 'lucide-react';
// TODO: Adapt these hooks/context to your frontend or reimplement as needed
// import { useApp } from '../../contexts/AppContext';
// import { useRealDataSources } from '../../hooks/useRealDataSources';

interface EliteSportsHeaderProps {
  connectedSources: number;
  dataQuality: number;
  state: any;
  toggleDarkMode: () => void;
  refreshData: () => Promise<void>;
  loading: boolean;
}

export const EliteSportsHeader: React.FC<EliteSportsHeaderProps> = ({
  connectedSources,
  dataQuality,
  state,
  toggleDarkMode,
  refreshData,
  loading,
}) => {
  const getDataStatusColor = () => {
    if (connectedSources === 0) return 'text-red-600';
    if (dataQuality > 0.7) return 'text-green-600';
    return 'text-yellow-600';
  };

  const getDataStatusText = () => {
    if (connectedSources === 0) return 'No Real Data';
    if (dataQuality > 0.7) return 'High Quality Real Data';
    return 'Limited Real Data';
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm p-6 border-b border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Elite Sports Intelligence Platform
          </h2>
          <div className="flex items-center space-x-4 mt-2">
            <div className="flex items-center space-x-2">
              {connectedSources > 0 ? (
                <Wifi className="w-4 h-4 text-green-600" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-600" />
              )}
              <span className={`font-semibold text-sm ${getDataStatusColor()}`}>
                {getDataStatusText()}
              </span>
            </div>
            <span className="text-gray-400">•</span>
            <span className="font-semibold text-blue-600 text-sm">
              {connectedSources} Sources Connected
            </span>
            <span className="text-gray-400">•</span>
            <span className="font-semibold text-purple-600 text-sm">
              {(dataQuality * 100).toFixed(1)}% Data Quality
            </span>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={refreshData}
            disabled={loading}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Refreshing...' : 'Refresh Real Data'}</span>
          </button>
          <button
            onClick={toggleDarkMode}
            className="p-3 rounded-2xl glass-morphism hover:bg-white/20 transition-all"
          >
            {state.darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </header>
  );
};
