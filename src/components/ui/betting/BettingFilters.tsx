import React, { memo, useState } from 'react';
import { useFilterStore } from '../../../stores/filterStore';
import { ConfidenceIndicator } from '../../../components/ConfidenceIndicator';

// Define the filter props interface locally
interface BettingFiltersProps {
  selectedSport: string;
  minConfidence: number;
  sortBy: 'confidence' | 'value' | 'odds';
  onFilterChange: (filters: {
    selectedSport: string;
    minConfidence: number;
    sortBy: 'confidence' | 'value' | 'odds';
  }) => void;
}

export const BettingFilters = memo<BettingFiltersProps>(
  ({ selectedSport, minConfidence, sortBy, onFilterChange }) => {
    // Preset management state/hooks
    const [presetName, setPresetName] = useState('');
    const [selectedPreset, setSelectedPreset] = useState<string>('');
    const savePreset = useFilterStore(s => s.savePreset);
    const loadPreset = useFilterStore(s => s.loadPreset);
    const removePreset = useFilterStore(s => s.removePreset);
    const listPresets = useFilterStore(s => s.listPresets);
    const presets = listPresets();

    const handleSportChange = (sport: string) => {
      onFilterChange({ selectedSport: sport, minConfidence, sortBy });
    };

    const handleConfidenceChange = (confidence: number) => {
      onFilterChange({ selectedSport, minConfidence: confidence, sortBy });
    };

    const handleSortChange = (sort: 'confidence' | 'value' | 'odds') => {
      onFilterChange({ selectedSport, minConfidence, sortBy: sort });
    };

    // Preset handlers
    const handleSavePreset = () => {
      if (presetName.trim()) {
        savePreset(presetName.trim());
        setPresetName('');
      }
    };
    const handleLoadPreset = (name: string) => {
      setSelectedPreset(name);
      loadPreset(name);
    };
    const handleRemovePreset = () => {
      if (selectedPreset) {
        removePreset(selectedPreset);
        setSelectedPreset('');
      }
    };

    return (
      <div className="glass-premium p-4 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sport</label>
            <select
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={selectedSport}
              onChange={e => handleSportChange(e.target.value)}
            >
              <option value="all">All Sports</option>
              <option value="NBA">NBA</option>
              <option value="NFL">NFL</option>
              <option value="MLB">MLB</option>
              <option value="NHL">NHL</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Min Confidence</label>
            <div className="flex items-center space-x-4">
              <input
                className="w-full"
                max="0.95"
                min="0.5"
                step="0.05"
                type="range"
                value={minConfidence}
                onChange={e => handleConfidenceChange(Number(e.target.value))}
              />
              <ConfidenceIndicator confidence={minConfidence} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
            <select
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              value={sortBy}
              onChange={e => handleSortChange(e.target.value as 'confidence' | 'value' | 'odds')}
            >
              <option value="confidence">Confidence</option>
              <option value="value">Expected Value</option>
              <option value="odds">Odds</option>
            </select>
          </div>
        </div>
        {/* Preset management UI */}
        <div className="mt-4 flex flex-col md:flex-row items-center gap-2">
          <select
            className="px-2 py-1 rounded border border-gray-300"
            value={selectedPreset}
            onChange={e => handleLoadPreset(e.target.value)}
          >
            <option value="">Select Preset</option>
            {presets.map(p => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
          <button
            className="ml-2 px-3 py-1 rounded bg-blue-500 text-white"
            disabled={!selectedPreset}
            onClick={handleRemovePreset}
          >
            Remove
          </button>
          <input
            className="ml-4 px-2 py-1 rounded border border-gray-300"
            placeholder="Preset name"
            type="text"
            value={presetName}
            onChange={e => setPresetName(e.target.value)}
          />
          <button
            className="ml-2 px-3 py-1 rounded bg-green-500 text-white"
            disabled={!presetName.trim()}
            onClick={handleSavePreset}
          >
            Save Preset
          </button>
        </div>
      </div>
    );
  }
);

BettingFilters.displayName = 'BettingFilters';
