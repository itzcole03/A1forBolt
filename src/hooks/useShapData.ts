import { useState, useEffect } from 'react';
import { ShapValue } from '../types/explainability';

interface ShapDataHookResult {
  features: ShapValue[];
  loading: boolean;
  error: string | null;
}

interface ShapDataHookParams {
  eventId: string;
  modelType?: string;
}

export function useShapData({
  eventId,
  modelType = 'default',
}: ShapDataHookParams): ShapDataHookResult {
  const [features, setFeatures] = useState<ShapValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShapData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/shap/${eventId}?model=${modelType}`);
        if (!response.ok) {
          throw new Error('Failed to fetch SHAP data');
        }

        const data = await response.json();

        // Transform the raw data into ShapValue objects
        const shapValues: ShapValue[] = Object.entries(data).map(([feature, value]) => ({
          feature,
          value: value as number,
          impact: value as number,
          weight: Math.abs(value as number) * 100, // Normalize to percentage
        }));

        setFeatures(shapValues);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchShapData();
    }
  }, [eventId, modelType]);

  return { features, loading, error };
}
