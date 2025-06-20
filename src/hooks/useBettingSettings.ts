import { useCallback } from 'react';
import { useBettingStore } from '../stores/bettingStore';
import type { BettingSettings } from '../services/bettingService';

export const useBettingSettings = () => {
  const { settings, isLoading, error, fetchSettings, updateSettings, setError } = useBettingStore();

  const handleRiskProfileChange = useCallback(
    (profile: BettingSettings['riskProfile']) => {
      updateSettings({ riskProfile: profile });
    },
    [updateSettings]
  );

  const handleStakeChange = useCallback(
    (stake: number) => {
      updateSettings({ stakeSize: stake });
    },
    [updateSettings]
  );

  const handleModelChange = useCallback(
    (modelId: string) => {
      updateSettings({ modelId });
    },
    [updateSettings]
  );

  const handleConfidenceThresholdChange = useCallback(
    (threshold: number) => {
      updateSettings({ confidenceThreshold: threshold });
    },
    [updateSettings]
  );

  const resetSettings = useCallback(async () => {
    try {
      await fetchSettings();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to reset settings');
    }
  }, [fetchSettings, setError]);

  return {
    settings,
    isLoading,
    error,
    fetchSettings,
    handleRiskProfileChange,
    handleStakeChange,
    handleModelChange,
    handleConfidenceThresholdChange,
    resetSettings,
  };
};
