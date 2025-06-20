import { mlService } from './mlService';

describe('mlService', () => {
  it('should initialize without errors', () => {
    expect(mlService).toBeDefined();
  });

  it('should expose getPrediction as a function', () => {
    expect(typeof mlService.getPrediction).toBe('function');
  });

  it('should expose detectPatterns as a function', () => {
    expect(typeof mlService.detectPatterns).toBe('function');
  });

  it('should expose assessRisk as a function', () => {
    expect(typeof mlService.assessRisk).toBe('function');
  });

  it('should expose getCommunityInsights as a function', () => {
    expect(typeof mlService.getCommunityInsights).toBe('function');
  });

  it('should expose generateAutomatedStrategy as a function', () => {
    expect(typeof mlService.generateAutomatedStrategy).toBe('function');
  });

  it('should expose getCorrelationAnalysis as a function', () => {
    expect(typeof mlService.getCorrelationAnalysis).toBe('function');
  });

  it('should expose createCustomMetric as a function', () => {
    expect(typeof mlService.createCustomMetric).toBe('function');
  });
});
