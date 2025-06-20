import React from 'react';
import { Meta, StoryObj } from '@storybook/react';
import { PredictionSummaryCard } from '../components/ui/PredictionSummaryCard';

const meta: Meta<typeof PredictionSummaryCard> = {
  title: 'Components/PredictionSummaryCard',
  component: PredictionSummaryCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    accuracy: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    payout: { control: { type: 'range', min: 1, max: 10, step: 0.1 } },
    kelly: { control: { type: 'range', min: 0, max: 1, step: 0.01 } },
    marketEdge: { control: { type: 'range', min: -20, max: 20, step: 0.5 } },
    dataQuality: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    confidence: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    riskLevel: {
      control: { type: 'select' },
      options: ['low', 'medium', 'high'],
    },
    onDetailsClick: { action: 'detailsClicked' },
    onAddToBetslip: { action: 'addToBetslipClicked' },
  },
};

export default meta;

type Story = StoryObj<typeof PredictionSummaryCard>;

export const Default: Story = {
  args: {
    accuracy: 78.5,
    payout: 2.5,
    kelly: 0.45,
    marketEdge: 12.3,
    dataQuality: 92,
    modelName: 'Advanced AI Model',
    confidence: 85,
    riskLevel: 'medium',
  },
};

export const WithCallbacks: Story = {
  args: {
    ...Default.args,
    modelName: 'Interactive Model',
    onDetailsClick: () => console.log('View details clicked'),
    onAddToBetslip: () => console.log('Add to betslip clicked'),
  },
};

export const HighRisk: Story = {
  args: {
    ...Default.args,
    modelName: 'High Risk Model',
    riskLevel: 'high',
    accuracy: 65,
    confidence: 60,
    marketEdge: 5.5,
  },
};

export const LowRisk: Story = {
  args: {
    ...Default.args,
    modelName: 'Low Risk Model',
    riskLevel: 'low',
    accuracy: 92,
    confidence: 95,
    marketEdge: 18.2,
  },
};
