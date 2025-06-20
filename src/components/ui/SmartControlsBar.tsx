import React from 'react';
import GlassCard from './GlassCard';

export interface SmartControlsBarProps {
  investment: number;
  onInvestmentChange: (v: number) => void;
  strategy: string;
  onStrategyChange: (v: string) => void;
  confidence: number;
  onConfidenceChange: (v: number) => void;
  model: string;
  onModelChange: (v: string) => void;
  dataQuality: number;
  onDataQualityChange: (v: number) => void;
  patternStrength: number;
  onPatternStrengthChange: (v: number) => void;
  className?: string;
}

const strategies = ['Conservative', 'Balanced', 'Aggressive'];
const models = ['Alpha', 'Beta', 'Ensemble'];

export const SmartControlsBar: React.FC<SmartControlsBarProps> = ({
  investment,
  onInvestmentChange,
  strategy,
  onStrategyChange,
  confidence,
  onConfidenceChange,
  model,
  onModelChange,
  dataQuality,
  onDataQualityChange,
  patternStrength,
  onPatternStrengthChange,
  className = '',
}) => (
  <GlassCard className={`flex flex-wrap items-center gap-4 p-6 animate-fade-in ${className}`}>
    <div className="flex flex-col items-start">
      <label className="text-xs text-gray-400 mb-1">Investment</label>
      <input
        type="number"
        min={1}
        max={10000}
        value={investment}
        onChange={e => onInvestmentChange(Number(e.target.value))}
        className="rounded bg-gray-100 dark:bg-gray-800 px-3 py-1 w-24 focus:outline-none"
      />
    </div>
    <div className="flex flex-col items-start">
      <label className="text-xs text-gray-400 mb-1">Strategy</label>
      <select
        value={strategy}
        onChange={e => onStrategyChange(e.target.value)}
        className="rounded bg-gray-100 dark:bg-gray-800 px-3 py-1 w-32 focus:outline-none"
      >
        {strategies.map(s => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
    <div className="flex flex-col items-start">
      <label className="text-xs text-gray-400 mb-1">Confidence</label>
      <input
        type="range"
        min={50}
        max={100}
        step={1}
        value={confidence}
        onChange={e => onConfidenceChange(Number(e.target.value))}
        className="accent-primary-500 w-32"
      />
      <span className="text-xs mt-1">{confidence}%</span>
    </div>
    <div className="flex flex-col items-start">
      <label className="text-xs text-gray-400 mb-1">Model</label>
      <select
        value={model}
        onChange={e => onModelChange(e.target.value)}
        className="rounded bg-gray-100 dark:bg-gray-800 px-3 py-1 w-32 focus:outline-none"
      >
        {models.map(m => <option key={m} value={m}>{m}</option>)}
      </select>
    </div>
    <div className="flex flex-col items-start">
      <label className="text-xs text-gray-400 mb-1">Data Quality</label>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={dataQuality}
        onChange={e => onDataQualityChange(Number(e.target.value))}
        className="accent-purple-400 w-32"
      />
      <span className="text-xs mt-1">{dataQuality}%</span>
    </div>
    <div className="flex flex-col items-start">
      <label className="text-xs text-gray-400 mb-1">Pattern Strength</label>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={patternStrength}
        onChange={e => onPatternStrengthChange(Number(e.target.value))}
        className="accent-yellow-400 w-32"
      />
      <span className="text-xs mt-1">{patternStrength}%</span>
    </div>
  </GlassCard>
);

export default SmartControlsBar;
