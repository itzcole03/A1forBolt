import { useMemo } from 'react';
import { useFilterStore } from '../stores/filterStore';
import { useStrategyInput } from '../contexts/StrategyInputContext';
import { useBettingAnalytics } from './useBettingAnalytics';
import { Sport, PropType } from '../types';

export function useFilteredPredictions() {
  const { activeFilters } = useFilterStore();
  const { strategyInput } = useStrategyInput();
  const { predictions, isLoading, error } = useBettingAnalytics();

  const filteredPredictions = useMemo(() => {
    if (!predictions) return [];

    return predictions.filter(prediction => {
      // Filter by sport
      if (
        strategyInput.selectedSports.length > 0 &&
        !strategyInput.selectedSports.includes(prediction.sport as Sport)
      ) {
        return false;
      }

      // Filter by prop type
      if (
        strategyInput.selectedPropTypes.length > 0 &&
        !strategyInput.selectedPropTypes.includes(prediction.propType as PropType)
      ) {
        return false;
      }

      // Filter by confidence
      if (prediction.confidence < strategyInput.minConfidence) {
        return false;
      }

      // Filter by payout range
      const payout = prediction.odds;
      if (payout < strategyInput.minPayout || payout > strategyInput.maxPayout) {
        return false;
      }

      // Filter by active filters
      const confidenceLevel =
        prediction.confidence >= 0.65 ? 'high' : prediction.confidence >= 0.55 ? 'medium' : 'low';
      const payoutLevel = payout >= 5 ? 'high' : payout >= 2 ? 'medium' : 'low';

      const relevantFilters = [
        prediction.sport,
        prediction.propType,
        `confidence_${confidenceLevel}`,
        `payout_${payoutLevel}`,
      ];

      return relevantFilters.some(filter => activeFilters.has(filter));
    });
  }, [predictions, activeFilters, strategyInput]);

  const hasResults = filteredPredictions.length > 0;

  return {
    predictions: filteredPredictions,
    loading: isLoading,
    error,
    hasResults,
    totalPredictions: predictions?.length ?? 0,
    filteredCount: filteredPredictions.length,
  };
}
