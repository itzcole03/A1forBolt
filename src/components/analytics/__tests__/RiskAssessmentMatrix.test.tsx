import React from 'react';
import { render, screen } from '@testing-library/react';
import RiskAssessmentMatrix from '../RiskAssessmentMatrix';
import { usePredictionStore } from '../../../stores/predictionStore';

jest.mock('../../../stores/predictionStore');
(usePredictionStore as jest.Mock).mockReturnValue({
  getLatestPredictions: () => [
    { analytics: { risk: { riskCategory: 'high' } } },
    { analytics: { risk: { riskCategory: 'medium' } } },
    { analytics: { risk: { riskCategory: 'high' } } },
  ],
});

describe('RiskAssessmentMatrix', () => {
  it('renders risk categories and counts', () => {
    render(<RiskAssessmentMatrix />);
    expect(screen.getByText('high: 2')).toBeInTheDocument();
    expect(screen.getByText('medium: 1')).toBeInTheDocument();
  });
});
