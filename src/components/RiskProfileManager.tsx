import React from 'react';
import { useRiskProfile } from '@/hooks/useRiskProfile';
import { RiskLevel } from '@/types/money-maker';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export function RiskProfileManager() {
  const { riskProfile, updateRiskProfile, setRiskLevel } = useRiskProfile();

  const handleRiskLevelChange = (value: string) => {
    setRiskLevel(value as RiskLevel);
  };

  const handleSliderChange = (key: keyof typeof riskProfile, value: number[]) => {
    updateRiskProfile({ [key]: value[0] });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Risk Profile Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Risk Level</Label>
          <Select value={riskProfile.level} onValueChange={handleRiskLevelChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select risk level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low Risk</SelectItem>
              <SelectItem value="medium">Medium Risk</SelectItem>
              <SelectItem value="high">High Risk</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Maximum Stake Percentage</Label>
          <Slider
            max={10}
            min={0.1}
            step={0.1}
            value={[riskProfile.maxStakePercentage]}
            onValueChange={value => handleSliderChange('maxStakePercentage', value)}
          />
          <div className="text-sm text-muted-foreground">
            {riskProfile.maxStakePercentage}% of bankroll
          </div>
        </div>

        <div className="space-y-2">
          <Label>Minimum Confidence</Label>
          <Slider
            max={95}
            min={50}
            step={1}
            value={[riskProfile.minConfidence * 100]}
            onValueChange={value => handleSliderChange('minConfidence', [value[0] / 100])}
          />
          <div className="text-sm text-muted-foreground">
            {Math.round(riskProfile.minConfidence * 100)}%
          </div>
        </div>

        <div className="space-y-2">
          <Label>Maximum Kelly Fraction</Label>
          <Slider
            max={50}
            min={5}
            step={1}
            value={[riskProfile.maxKellyFraction * 100]}
            onValueChange={value => handleSliderChange('maxKellyFraction', [value[0] / 100])}
          />
          <div className="text-sm text-muted-foreground">
            {Math.round(riskProfile.maxKellyFraction * 100)}%
          </div>
        </div>

        <div className="space-y-2">
          <Label>Stop Loss</Label>
          <Slider
            max={20}
            min={1}
            step={1}
            value={[riskProfile.stopLossPercentage]}
            onValueChange={value => handleSliderChange('stopLossPercentage', value)}
          />
          <div className="text-sm text-muted-foreground">
            {riskProfile.stopLossPercentage}% of bankroll
          </div>
        </div>

        <div className="space-y-2">
          <Label>Take Profit</Label>
          <Slider
            max={50}
            min={5}
            step={1}
            value={[riskProfile.takeProfitPercentage]}
            onValueChange={value => handleSliderChange('takeProfitPercentage', value)}
          />
          <div className="text-sm text-muted-foreground">
            {riskProfile.takeProfitPercentage}% of bankroll
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Diversification Rules</h3>

          <div className="space-y-2">
            <Label>Maximum Bets per Sport</Label>
            <Slider
              max={5}
              min={1}
              step={1}
              value={[riskProfile.diversificationRules.maxBetsPerSport]}
              onValueChange={value =>
                updateRiskProfile({
                  diversificationRules: {
                    ...riskProfile.diversificationRules,
                    maxBetsPerSport: value[0],
                  },
                })
              }
            />
            <div className="text-sm text-muted-foreground">
              {riskProfile.diversificationRules.maxBetsPerSport} bets
            </div>
          </div>

          <div className="space-y-2">
            <Label>Maximum Bets per Market</Label>
            <Slider
              max={3}
              min={1}
              step={1}
              value={[riskProfile.diversificationRules.maxBetsPerMarket]}
              onValueChange={value =>
                updateRiskProfile({
                  diversificationRules: {
                    ...riskProfile.diversificationRules,
                    maxBetsPerMarket: value[0],
                  },
                })
              }
            />
            <div className="text-sm text-muted-foreground">
              {riskProfile.diversificationRules.maxBetsPerMarket} bets
            </div>
          </div>

          <div className="space-y-2">
            <Label>Maximum Exposure per Event</Label>
            <Slider
              max={15}
              min={1}
              step={1}
              value={[riskProfile.diversificationRules.maxExposurePerEvent]}
              onValueChange={value =>
                updateRiskProfile({
                  diversificationRules: {
                    ...riskProfile.diversificationRules,
                    maxExposurePerEvent: value[0],
                  },
                })
              }
            />
            <div className="text-sm text-muted-foreground">
              {riskProfile.diversificationRules.maxExposurePerEvent}% of bankroll
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
