import { act } from 'react-dom/test-utils';
import { useConfidenceStore } from '../confidenceSlice';
import type { ConfidenceBand, WinProbability, PredictionWithConfidence } from '../../../types/confidence';

describe('confidenceSlice', () => {
  it('sets and clears prediction, confidenceBand, and winProbability', () => {
    const band: ConfidenceBand = { lower: 10, upper: 20, mean: 15, confidenceLevel: 0.95 };
    const winProb: WinProbability = { probability: 0.7, impliedOdds: 1.43, modelOdds: 1.5, updatedAt: new Date().toISOString() };
    const pred: PredictionWithConfidence = {
      predictionId: '1', eventId: 'E1', predictedValue: 15, confidenceBand: band, winProbability: winProb, model: 'M', market: 'points',
    };
    act(() => {
      useConfidenceStore.getState().setPrediction(pred);
    });
    expect(useConfidenceStore.getState().prediction).toEqual(pred);
    expect(useConfidenceStore.getState().confidenceBand).toEqual(band);
    expect(useConfidenceStore.getState().winProbability).toEqual(winProb);
    act(() => {
      useConfidenceStore.getState().clear();
    });
    expect(useConfidenceStore.getState().prediction).toBeNull();
    expect(useConfidenceStore.getState().confidenceBand).toBeNull();
    expect(useConfidenceStore.getState().winProbability).toBeNull();
  });
});
