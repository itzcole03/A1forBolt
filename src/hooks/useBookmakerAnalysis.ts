import { useState, useEffect } from 'react';
import { bookmakerAnalysisService } from '../services/analytics/BookmakerAnalysisService';

export interface BookmakerAnalysisState {
  isLoading: boolean;
  error: string | null;
  analysis: {
    suspiciousLevel: number;
    warning?: string;
    adjustedProbability: number;
    riskScore: number;
  } | null;
}

export interface PropData {
  playerId: string;
  propType: string;
  projectedValue: number;
  tag: 'demon' | 'goblin' | 'normal';
  currentOdds: number;
  historicalAverage: number;
}

export const useBookmakerAnalysis = (propData: PropData | null) => {
  const [state, setState] = useState<BookmakerAnalysisState>({
    isLoading: false,
    error: null,
    analysis: null,
  });

  useEffect(() => {
    if (!propData) {
      setState((prev: BookmakerAnalysisState) => ({ ...prev, analysis: null }));
      return;
    }

    const fetchAnalysis = async () => {
      setState((prev: BookmakerAnalysisState) => ({ ...prev, isLoading: true, error: null }));

      try {
        const analysis = await bookmakerAnalysisService.analyzeProp(propData);

        setState({
          isLoading: false,
          error: null,
          analysis: {
            suspiciousLevel: analysis.bookmakerIntent.suspiciousLevel,
            warning: analysis.warnings.join(' '),
            adjustedProbability: analysis.adjustedProbability,
            riskScore: analysis.riskScore,
          },
        });
      } catch (error) {
        setState({
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to analyze prop',
          analysis: null,
        });
      }
    };

    fetchAnalysis();
  }, [propData]);

  const refreshAnalysis = async () => {
    if (!propData) return;

    setState((prev: BookmakerAnalysisState) => ({ ...prev, isLoading: true, error: null }));

    try {
      const analysis = await bookmakerAnalysisService.analyzeProp(propData);

      setState({
        isLoading: false,
        error: null,
        analysis: {
          suspiciousLevel: analysis.bookmakerIntent.suspiciousLevel,
          warning: analysis.warnings.join(' '),
          adjustedProbability: analysis.adjustedProbability,
          riskScore: analysis.riskScore,
        },
      });
    } catch (error) {
      setState({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to analyze prop',
        analysis: null,
      });
    }
  };

  return {
    ...state,
    refreshAnalysis,
  };
};

export default useBookmakerAnalysis;
