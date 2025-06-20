import React from 'react';
import { render, screen } from '@testing-library/react';
import ShapExplanation from '../ShapExplanation';
import { usePredictionStore } from '../../../stores/predictionStore';

jest.mock('../../../stores/predictionStore');

const mockShap = {
  featureImportances: [
    { feature: 'team_strength', value: 0.5 },
    { feature: 'recent_form', value: 0.3 },
  ],
};

(usePredictionStore as jest.Mock).mockReturnValue({
  predictionsByEvent: { 'event1': { analytics: { shap: mockShap } } },
});

describe('ShapExplanation', () => {
  it('renders SHAP feature importances', () => {
    render(<ShapExplanation eventId="event1" />);
    expect(screen.getByText('SHAP Feature Importances')).toBeInTheDocument();
    expect(screen.getByText('team_strength: 0.5')).toBeInTheDocument();
    expect(screen.getByText('recent_form: 0.3')).toBeInTheDocument();
  });
});
