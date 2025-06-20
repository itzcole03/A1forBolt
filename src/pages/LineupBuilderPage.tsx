import React, { useState } from 'react';
import GlassCard from '../components/ui/GlassCard';
import EnhancedPropCard from '../components/ui/EnhancedPropCard';
import GlowButton from '../components/ui/GlowButton';
import Tooltip from '../components/ui/Tooltip';
import {
  Grid,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Slider,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import { LineupBuilderStrategy, LineupBuilderOutput } from '@/types/predictions';
import { LineupLeg, Lineup } from '@/types/lineup';
import { predictionService } from '@/services/prediction';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { usePredictionStore } from '@/store/predictionStore';

const convertToLineup = (output: LineupBuilderOutput): Lineup => ({
  id: output.id,
  timestamp: output.timestamp,
  strategy: output.strategy,
  legs: output.legs.map(leg => ({
    propType: leg.propType,
    line: leg.line.toString(),
    odds: leg.odds,
  })),
  performance: {
    expectedValue: output.performance.expectedValue,
    winProbability: output.performance.winProbability,
    riskScore: output.performance.riskScore,
  },
});

const LineupBuilderPage: React.FC = () => {
  const {
    currentLineup,
    setCurrentLineup,
    savedLineups,
    addSavedLineup,
    isLoading,
    setIsLoading,
    error,
    setError,
  } = usePredictionStore();

  const [strategy, setStrategy] = useState<LineupBuilderStrategy>({
    id: 'default',
    name: 'Default Strategy',
    type: 'balanced',
    targetConfidence: 75,
    maxLegs: 5,
    minLegs: 2,
    maxSameTeam: 2,
    riskProfile: {
      maxVariance: 0.5,
      maxCorrelation: 0.3,
      minExpectedValue: 0.1,
    },
  });

  const handleStrategyTypeChange = (event: SelectChangeEvent) => {
    const type = event.target.value as 'goblin' | 'demon' | 'balanced';
    setStrategy(prev => ({
      ...prev,
      type,
      targetConfidence: type === 'goblin' ? 84 : type === 'demon' ? 65 : 75,
      riskProfile: {
        ...prev.riskProfile,
        maxVariance: type === 'goblin' ? 0.3 : type === 'demon' ? 0.7 : 0.5,
        minExpectedValue: type === 'goblin' ? 0.15 : type === 'demon' ? 0.05 : 0.1,
      },
    }));
  };

  const handleConfidenceChange = (_: Event, value: number | number[]) => {
    setStrategy(prev => ({
      ...prev,
      targetConfidence: value as number,
    }));
  };

  const handleLegsChange = (event: SelectChangeEvent) => {
    const [min, max] = (event.target.value as string).split('-').map(Number);
    setStrategy(prev => ({
      ...prev,
      minLegs: min,
      maxLegs: max,
    }));
  };

  const handleSameTeamChange = (event: SelectChangeEvent) => {
    setStrategy(prev => ({
      ...prev,
      maxSameTeam: Number(event.target.value),
    }));
  };

  const generateLineup = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await predictionService.generateLineup(strategy);
      setCurrentLineup(convertToLineup(result));
    } catch (error) {
      console.error('Failed to generate lineup:', error);
      setError('Failed to generate lineup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveLineup = () => {
    if (currentLineup) {
      addSavedLineup(currentLineup);
    }
  };

  const handlePlaceLineup = () => {
    // Implement lineup placement logic
    console.log('Placing lineup:', currentLineup);
  };

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent mb-6">
        Lineup Builder
      </h1>

      {error && (
        <GlassCard className="mb-3">
          <div className="text-red-600 font-semibold">{error}</div>
        </GlassCard>
      )}

      {/* Strategy Configuration */}
      <GlassCard className="mb-6">
        <Grid container spacing={3}>
          <Grid item md={6} xs={12}>
            <FormControl fullWidth>
              <InputLabel>Strategy Type</InputLabel>
              <Select
                label="Strategy Type"
                value={strategy.type}
                onChange={handleStrategyTypeChange}
              >
                <MenuItem value="goblin">Goblin (Conservative)</MenuItem>
                <MenuItem value="demon">Demon (Aggressive)</MenuItem>
                <MenuItem value="balanced">Balanced</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item md={6} xs={12}>
            <Typography gutterBottom>Target Confidence</Typography>
            <Slider
              max={95}
              min={50}
              value={strategy.targetConfidence}
              valueLabelDisplay="auto"
              valueLabelFormat={value => `${value}%`}
              onChange={handleConfidenceChange}
            />
          </Grid>

          <Grid item md={6} xs={12}>
            <FormControl fullWidth>
              <InputLabel>Number of Legs</InputLabel>
              <Select
                label="Number of Legs"
                value={`${strategy.minLegs}-${strategy.maxLegs}`}
                onChange={handleLegsChange}
              >
                <MenuItem value="2-3">2-3 Legs</MenuItem>
                <MenuItem value="3-4">3-4 Legs</MenuItem>
                <MenuItem value="4-5">4-5 Legs</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item md={6} xs={12}>
            <FormControl fullWidth>
              <InputLabel>Max Same Team</InputLabel>
              <Select
                label="Max Same Team"
                value={strategy.maxSameTeam.toString()}
                onChange={handleSameTeamChange}
              >
                <MenuItem value="1">1 Player</MenuItem>
                <MenuItem value="2">2 Players</MenuItem>
                <MenuItem value="3">3 Players</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        <Button
          fullWidth
          color="primary"
          disabled={isLoading}
          sx={{ mt: 3 }}
          variant="contained"
          onClick={generateLineup}
        >
          Generate Lineup
        </Button>
      </GlassCard>

      {/* Generated Lineup */}
      {isLoading ? (
        <div className="flex justify-center p-6">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : currentLineup ? (
        <GlassCard>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Generated Lineup</h2>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                currentLineup.performance.winProbability >= 80
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}
            >
              {formatPercentage(currentLineup.performance.winProbability)} Win Probability
            </span>
          </div>
          <div className="mb-2 text-gray-500">
            Expected Value: {formatCurrency(currentLineup.performance.expectedValue)}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
            {currentLineup.legs.map((leg: LineupLeg, index: number) => (
              <EnhancedPropCard
                key={index}
                playerName={leg.playerName || ''}
                team={leg.team || ''}
                position={leg.position || ''}
                statType={leg.propType}
                line={leg.line}
                overOdds={leg.odds}
                underOdds={leg.odds}
                pickType={leg.pickType}
                trendValue={leg.trendValue}
                gameInfo={leg.gameInfo}
                playerImageUrl={leg.playerImageUrl}
                onSelect={() => {}}
                onViewDetails={() => {}}
              />
            ))}
          </div>
          <div className="mt-6 flex gap-4">
            <GlowButton onClick={handlePlaceLineup} className="flex-1">
              Place Lineup
            </GlowButton>
            <GlowButton onClick={handleSaveLineup} className="flex-1 bg-white text-primary-600 border border-primary-500">
              Save Lineup
            </GlowButton>
          </div>
        </GlassCard>
      ) : null}

      {/* Saved Lineups */}
      {savedLineups.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Saved Lineups</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {savedLineups.map((lineup: Lineup) => (
              <GlassCard key={lineup.id}>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">{lineup.strategy.name}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      lineup.performance.winProbability >= 80
                        ? 'bg-green-100 text-green-700'
                        : 'bg-yellow-100 text-yellow-700'
                    }`}
                  >
                    {formatPercentage(lineup.performance.winProbability)} Win Probability
                  </span>
                </div>
                <div className="mb-2 text-gray-500">
                  Expected Value: {formatCurrency(lineup.performance.expectedValue)}
                </div>
                <div className="grid grid-cols-1 gap-2 mt-2">
                  {lineup.legs.map((leg: LineupLeg, index: number) => (
                    <EnhancedPropCard
                      key={index}
                      playerName={leg.playerName || ''}
                      team={leg.team || ''}
                      position={leg.position || ''}
                      statType={leg.propType}
                      line={leg.line}
                      overOdds={leg.odds}
                      underOdds={leg.odds}
                      pickType={leg.pickType}
                      trendValue={leg.trendValue}
                      gameInfo={leg.gameInfo}
                      playerImageUrl={leg.playerImageUrl}
                      onSelect={() => {}}
                      onViewDetails={() => {}}
                    />
                  ))}
                </div>
                <GlowButton onClick={() => setCurrentLineup(lineup)} className="w-full mt-4">
                  Load Lineup
                </GlowButton>
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default LineupBuilderPage;
