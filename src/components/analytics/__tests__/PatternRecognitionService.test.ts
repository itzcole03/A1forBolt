import { PatternRecognitionService } from '../../../services/analytics/PatternRecognitionService';
describe('PatternRecognitionService', () => {
  it('detects pattern structure', () => {
    const result = PatternRecognitionService.analyzeMarketPatterns([{ odds: 2.0 }]);
    expect(result).toHaveProperty('inefficiencies');
    expect(result).toHaveProperty('streaks');
    expect(result).toHaveProperty('biases');
  });
});
