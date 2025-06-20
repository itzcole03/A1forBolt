import { ShapExplainerService } from '../../../services/analytics/ShapExplainerService';
describe('ShapExplainerService', () => {
  it('returns feature importances', async () => {
    const result = await ShapExplainerService.explainPrediction({ modelName: 'test' }, { a: 1 });
    expect(result.featureImportances).toBeDefined();
    expect(Array.isArray(result.featureImportances)).toBe(true);
  });
});
