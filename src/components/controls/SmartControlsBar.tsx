import { useSportsFilter } from '@/hooks/useSportsFilter';
import { useQueryClient } from '@tanstack/react-query';
import { LINEUP_QUERY_KEY } from '@/hooks/useLineupAPI';
import { PREDICTIONS_QUERY_KEY } from '@/hooks/usePredictions';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { useFilterStore, RiskProfile } from '@/stores/filterStore';
import React from 'react';

interface SmartControlsBarProps {
  className?: string;
}

const modelOptions = [
  { value: 'default', label: 'Default' },
  { value: 'ensemble', label: 'Ensemble' },
  { value: 'experimental', label: 'Experimental' },
];

export function SmartControlsBar({ className = '' }: SmartControlsBarProps) {
  const { sports, activeSport, setActiveSport } = useSportsFilter();
  const queryClient = useQueryClient();
  const {
    riskProfile,
    setRiskProfile,
    stakeSizing,
    setStakeSizing,
    model,
    setModel,
    confidenceThreshold,
    setConfidenceThreshold,
  } = useFilterStore();

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: [LINEUP_QUERY_KEY] });
    queryClient.invalidateQueries({ queryKey: [PREDICTIONS_QUERY_KEY] });
  };

  return (
    <div
      className={`flex flex-wrap items-center justify-between border-b border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 gap-4 ${className}`}
    >
      <div className="flex items-center space-x-4">
        {sports.map(sport => (
          <button
            key={sport.id}
            className={`flex items-center space-x-2 rounded-lg px-4 py-2 transition-colors ${
              activeSport?.id === sport.id
                ? 'bg-primary-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
            }`}
            onClick={() => setActiveSport(sport)}
          >
            <span className="text-xl">{sport.icon}</span>
            <span className="font-medium">{sport.name}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center space-x-4 gap-2">
        {/* Model Selection */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Model:</span>
          <select
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700"
            value={model}
            onChange={e => setModel(e.target.value)}
          >
            {modelOptions.map(opt => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Risk Profile */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Risk Profile:</span>
          <select
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700"
            value={riskProfile}
            onChange={e => setRiskProfile(e.target.value as RiskProfile)}
          >
            <option value="conservative">Conservative</option>
            <option value="balanced">Balanced</option>
            <option value="aggressive">Aggressive</option>
          </select>
        </div>

        {/* Stake Sizing */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Stake Sizing:</span>
          <input
            className="w-24 accent-primary-500"
            max={20}
            min={1}
            step={1}
            type="range"
            value={stakeSizing}
            onChange={e => setStakeSizing(Number(e.target.value))}
          />
          <span className="text-xs text-gray-500 dark:text-gray-400">{stakeSizing}%</span>
        </div>

        {/* Confidence Threshold */}
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Confidence Threshold:</span>
          <select
            className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700"
            value={confidenceThreshold}
            onChange={e => setConfidenceThreshold(Number(e.target.value))}
          >
            <option value={0}>All</option>
            <option value={0.7}>70%+</option>
            <option value={0.8}>80%+</option>
            <option value={0.9}>90%+</option>
          </select>
        </div>

        {/* Refresh Button */}
        <button
          className="flex items-center space-x-2 rounded-lg bg-gray-100 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          onClick={handleRefresh}
        >
          <ArrowPathIcon className="h-5 w-5" />
          <span>Refresh Data</span>
        </button>
      </div>
    </div>
  );
}
