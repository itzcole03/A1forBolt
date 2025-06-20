import React, { useState } from 'react';
import { useStore } from '../../../stores/useStore';
import type { PlayerProp, Entry } from '../../../types/core';
import { getErrorMessage } from '../../../utils/errorUtils';
import { isTeamDiversified, validateEntry } from '../../../utils/businessRules';
import { oddsToDecimal, calculatePotentialPayout, calculateWinProbability } from '../../../utils/odds';
import { SmartControlsBar } from '../../../components/controls/SmartControlsBar';
import GlassCard from '../../../components/ui/GlassCard';
import EnhancedPropCard from '../../../components/ui/EnhancedPropCard';
import PredictionExplanationOverlay from '../../../components/ui/PredictionExplanationOverlay';
import { PayoutPreview } from '../../../components/PayoutPreview';

export const BetBuilder: React.FC = () => {
  const selectedProps = useStore((s: any) => s.selectedProps);
  const clearSelectedProps = useStore((s: any) => s.clearSelectedProps);
  const addEntry = useStore((s: any) => s.addEntry);
  const [entry, setEntry] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [overlayOpen, setOverlayOpen] = useState(false);

  // Odds and payout calculation
  const oddsArr = selectedProps.map((p: PlayerProp) => p.odds.toString());
  const payout = calculatePotentialPayout(entry, oddsArr);
  const winProb = calculateWinProbability(selectedProps.map((p: PlayerProp) => p.confidence));
  const diversified = isTeamDiversified(selectedProps);
  const combinedDecimal = oddsArr.reduce((acc: number, o: string) => acc * oddsToDecimal(o), 1);

  // Bonus and enhancement (placeholder logic)
  const bonusPercent = selectedProps.length * 2; // Example: 2% per pick
  const enhancementPercent = selectedProps.reduce((acc: number, p: PlayerProp) => acc + ((p as any).aiBoost || 0), 0) / (selectedProps.length || 1);

  // Submit betslip
  const handleSubmit = async () => {
    setError(null);
    setSuccess(null);
    if (selectedProps.length < 2) {
      setError('You must select at least 2 picks.');
      return;
    }
    if (!diversified) {
      setError('Too many props from the same team.');
      return;
    }
    const entryObj: Entry = {
      id: '',
      userId: '',
      status: 'pending',
      type: 'parlay',
      props: selectedProps,
      stake: entry,
      potentialPayout: payout,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const validationErrors = validateEntry(entryObj);
    if (validationErrors.length) {
      setError(validationErrors.join(' '));
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/entries/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entryObj),
      });
      if (!res.ok) {
        const err = await res.json();
        setError(getErrorMessage(err));
        setLoading(false);
        return;
      }
      addEntry(entryObj);
      setSuccess('Entry submitted successfully!');
      clearSelectedProps();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // Add missing variable/type definitions for props, isLoadingProps, propsError, availableProps, handleSelect, handleViewDetails, riskMultiplier, projectedEV
  // For demonstration, use placeholders or simple logic if not already defined
  const isLoadingProps = false;
  const propsError = null;
  const availableProps: PlayerProp[] = [];
  const handleSelect = (prop: PlayerProp, pick: string) => {};
  const handleViewDetails = (prop: PlayerProp) => {};
  const riskMultiplier = 1.0;
  const projectedEV = 0;

  return (
    <div className="space-y-6">
      <SmartControlsBar className="mb-4 glass-card animate-fade-in" />
      {/* Left: Available Props */}
      <div className="flex-1 space-y-4">
        <GlassCard className="p-4 animate-scale-in">
          <h2 className="text-xl font-bold mb-2 text-primary-600">Available Props</h2>
          {isLoadingProps && <div className="text-gray-400">Loading props...</div>}
          {propsError && <div className="text-red-500">Failed to load props.</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {availableProps.map((prop: any) => (
              <EnhancedPropCard
                key={prop.id}
                playerName={prop.player?.name || prop.playerName}
                statType={prop.type}
                line={prop.line}
                overOdds={prop.odds?.over ?? prop.overOdds}
                underOdds={prop.odds?.under ?? prop.underOdds}
                sentiment={prop.sentiment}
                aiBoost={prop.aiBoost}
                patternStrength={prop.patternStrength}
                bonusPercent={bonusPercent}
                enhancementPercent={enhancementPercent}
                selected={selectedProps.some((p: PlayerProp) => p.id === prop.id)}
                onSelect={pick => handleSelect(prop, pick)}
                onViewDetails={() => handleViewDetails(prop)}
                className="transition-transform duration-200 hover:scale-105"
              />
            ))}
          </div>
        </GlassCard>
      </div>
      {/* Right: Bet Slip and Payout Preview */}
      <div className="flex-1 space-y-6">
        <GlassCard className="p-4 animate-fade-in">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              <div>
                <label className="block text-sm font-medium text-gray-700">Entry</label>
                <div className="premium-input-container w-24">
                  <span className="currency-symbol">$</span>
                  <input
                    className="premium-input text-gray-900"
                    max={1000}
                    min={1}
                    type="number"
                    value={entry}
                    onChange={e => setEntry(Number(e.target.value))}
                  />
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 font-medium">Payout</div>
                <div className="text-xl font-bold text-green-600 animate-glow">${payout.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 font-medium">Win Prob</div>
                <div className="text-xl font-bold text-blue-600">{winProb.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 font-medium">Combined Odds</div>
                <div className="text-xl font-bold text-purple-600">{combinedDecimal.toFixed(2)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 font-medium">Bonus %</div>
                <div className="text-lg text-green-500 font-bold">{bonusPercent}%</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 font-medium">Enhance %</div>
                <div className="text-lg text-blue-500 font-bold">{enhancementPercent.toFixed(1)}%</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 font-medium">Risk Multiplier</div>
                <div className="text-lg text-yellow-500 font-bold">{riskMultiplier.toFixed(2)}x</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 font-medium">Projected EV</div>
                <div className={`text-lg font-bold ${projectedEV >= 0 ? 'text-green-600' : 'text-red-500'}`}>{projectedEV.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </GlassCard>
        <GlassCard className="p-4 animate-fade-in">
          <h3 className="text-lg font-semibold text-primary-600 mb-2">Your Picks</h3>
          {selectedProps.length === 0 && <div className="text-gray-400">No picks selected yet.</div>}
          <div className="space-y-2">
            {selectedProps.map((leg: PlayerProp) => (
              <EnhancedPropCard
                key={leg.id}
                playerName={leg.player?.name || (leg as any).playerName}
                statType={leg.type}
                line={leg.line}
                overOdds={(leg as any).odds?.over ?? (leg as any).overOdds}
                underOdds={(leg as any).odds?.under ?? (leg as any).underOdds}
                sentiment={(leg as any).sentiment}
                aiBoost={(leg as any).aiBoost}
                patternStrength={(leg as any).patternStrength}
                bonusPercent={bonusPercent}
                enhancementPercent={enhancementPercent}
                selected={true}
                onSelect={(pick: 'over' | 'under') => handleSelect(leg, pick)}
                onViewDetails={() => handleViewDetails(leg)}
                className="opacity-90"
              />
            ))}
          </div>
          {/* --- POE-preview: PayoutPreview integration --- */}
          {selectedProps.length > 0 && (
            <div className="mt-6 animate-fade-in">
              <PayoutPreview eventId={selectedProps[0].id} />
            </div>
          )}
        </GlassCard>
        {error && <div className="p-4 text-red-600 text-sm font-medium">{error}</div>}
        {success && <div className="p-4 text-green-600 text-sm font-medium">{success}</div>}
        <div className="flex justify-end">
          <button
            className="modern-button bg-primary-500 text-white px-8 py-3 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading || selectedProps.length < 2}
            onClick={handleSubmit}
          >
            {loading ? <span className="loading-spinner-premium"></span> : 'Submit Entry'}
          </button>
        </div>
      </div>
      {/* Overlay for prediction explanation */}
      <PredictionExplanationOverlay
        open={overlayOpen}
        onClose={() => setOverlayOpen(false)}
        data={{}}
      />
    </div>
  );
};
