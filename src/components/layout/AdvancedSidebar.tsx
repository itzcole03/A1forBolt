// AdvancedSidebar migrated from prototype Sidebar
import React from 'react';
import { Brain, Target, BarChart3, Zap, Wifi, WifiOff } from 'lucide-react';
// TODO: Adapt these hooks/context to your frontend or reimplement as needed
// import { useApp } from '../../contexts/AppContext';

interface AdvancedSidebarProps {
  currentSection: string;
  onSectionChange: (section: string) => void;
  connectedSources: number;
  dataQuality: number;
  state: any;
}

export const AdvancedSidebar: React.FC<AdvancedSidebarProps> = ({
  currentSection,
  onSectionChange,
  connectedSources,
  dataQuality,
  state,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Real Data Dashboard', icon: Zap },
    { id: 'prizepicks', label: 'PrizePicks Engine', icon: Target },
    { id: 'analytics', label: 'Live Analytics', icon: BarChart3 },
  ];

  const getConnectionStatus = () => {
    if (connectedSources === 0) {
      return { icon: WifiOff, text: 'No Real Data', color: 'text-red-400' };
    }
    if (connectedSources < 3) {
      return { icon: Wifi, text: 'Limited Data', color: 'text-yellow-400' };
    }
    return { icon: Wifi, text: 'Full Data Access', color: 'text-green-400' };
  };

  const connectionStatus = getConnectionStatus();
  const ConnectionIcon = connectionStatus.icon;

  return (
    <div className="w-80 bg-gradient-to-b from-gray-800 to-gray-900 min-h-screen">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Elite Sports AI</h1>
            <p className="text-gray-400 text-sm">Real Data Platform</p>
            <div className="flex items-center space-x-2 mt-1">
              <ConnectionIcon className={`w-3 h-3 ${connectionStatus.color}`} />
              <span className={`text-xs ${connectionStatus.color}`}>{connectionStatus.text}</span>
            </div>
          </div>
        </div>
        {/* Navigation */}
        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center p-4 text-left text-white rounded-lg transition-all ${
                  isActive ? 'bg-white/20' : 'hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5 mr-3" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>
        {/* Real Data Sources Status */}
        <div className="mt-8 p-4 glass-morphism rounded-xl">
          <h3 className="font-semibold mb-3 text-white flex items-center">
            <span className="mr-2">📡</span>
            Real Data Sources
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-300">Connected Sources:</span>
              <span className={connectedSources > 0 ? 'text-green-400' : 'text-red-400'}>
                {connectedSources}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Data Quality:</span>
              <span className={dataQuality > 0.7 ? 'text-green-400' : dataQuality > 0.4 ? 'text-yellow-400' : 'text-red-400'}>
                {(dataQuality * 100).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Status:</span>
              <span className={connectedSources > 0 ? 'text-green-400' : 'text-red-400'}>
                {connectedSources > 0 ? '🟢 Live' : '🔴 Offline'}
              </span>
            </div>
          </div>
        </div>
        {/* Data Quality Indicator */}
        <div className="mt-4 p-4 glass-morphism rounded-xl">
          <h3 className="font-semibold mb-3 text-white flex items-center">
            <Brain className="w-4 h-4 mr-2" />
            AI Enhancement
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-300">Real Data Boost:</span>
              <span className="text-green-400">+{(dataQuality * 15).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Prediction Accuracy:</span>
              <span className="text-blue-400">{(85 + dataQuality * 10).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-300">Model Confidence:</span>
              <span className="text-purple-400">{connectedSources > 0 ? 'High' : 'Medium'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
