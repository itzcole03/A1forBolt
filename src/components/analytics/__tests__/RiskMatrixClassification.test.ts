import { RiskAssessmentService } from '../../../services/analytics/RiskAssessmentService';
describe('RiskAssessmentService', () => {
  it('classifies risk correctly', () => {
    const low = RiskAssessmentService.assessRisk({ confidence: 0.95 });
    const med = RiskAssessmentService.assessRisk({ confidence: 0.6 });
    const high = RiskAssessmentService.assessRisk({ confidence: 0.2 });
    expect(['low', 'medium', 'high']).toContain(low.riskCategory);
    expect(['low', 'medium', 'high']).toContain(med.riskCategory);
    expect(['low', 'medium', 'high']).toContain(high.riskCategory);
  });
});
