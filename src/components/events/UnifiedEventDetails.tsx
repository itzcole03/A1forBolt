import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { UnifiedServiceRegistry } from '../../services/unified/UnifiedServiceRegistry';
import { UnifiedPredictionService } from '../../services/unified/UnifiedPredictionService';
import { UnifiedAnalyticsService } from '../../services/unified/UnifiedAnalyticsService';
import { UnifiedStateService } from '../../services/unified/UnifiedStateService';
import { UnifiedNotificationService } from '../../services/unified/UnifiedNotificationService';
import { UnifiedErrorService } from '../../services/unified/UnifiedErrorService';
import { Card, Button, Spinner, Toast, Badge, Modal, Tabs, Tab } from '../ui/UnifiedUI';

interface Event {
  id: string;
  name: string;
  sport: string;
  competition: string;
  startTime: string;
  status: 'upcoming' | 'live' | 'ended' | 'cancelled';
  homeTeam: {
    id: string;
    name: string;
    logo: string;
    stats: TeamStats;
  };
  awayTeam: {
    id: string;
    name: string;
    logo: string;
    stats: TeamStats;
  };
  venue: {
    name: string;
    city: string;
    country: string;
  };
  weather?: {
    condition: string;
    temperature: number;
    windSpeed: number;
    precipitation: number;
  };
  markets: Market[];
  predictions: Prediction[];
  statistics: EventStatistics;
}

interface TeamStats {
  form: string[];
  goalsScored: number;
  goalsConceded: number;
  cleanSheets: number;
  winRate: number;
  averageGoals: number;
  homeAdvantage?: number;
  awayDisadvantage?: number;
}

interface Market {
  id: string;
  type: string;
  name: string;
  selections: Selection[];
  status: 'open' | 'suspended' | 'closed';
  lastUpdated: string;
}

interface Selection {
  id: string;
  name: string;
  odds: number;
  probability: number;
  prediction?: {
    confidence: number;
    expectedValue: number;
    kellyFraction: number;
  };
}

interface Prediction {
  marketType: string;
  selection: string;
  confidence: number;
  expectedValue: number;
  kellyFraction: number;
  factors: {
    name: string;
    impact: number;
    description: string;
  }[];
}

interface EventStatistics {
  headToHead: {
    total: number;
    homeWins: number;
    awayWins: number;
    draws: number;
    lastFive: Array<{
      date: string;
      homeTeam: string;
      awayTeam: string;
      score: string;
      winner: string;
    }>;
  };
  form: {
    home: {
      lastFive: string[];
      goalsScored: number;
      goalsConceded: number;
    };
    away: {
      lastFive: string[];
      goalsScored: number;
      goalsConceded: number;
    };
  };
  trends: {
    overUnder: {
      over2_5: number;
      under2_5: number;
      averageGoals: number;
    };
    bothTeamsToScore: {
      yes: number;
      no: number;
      percentage: number;
    };
    firstHalf: {
      homeWins: number;
      awayWins: number;
      draws: number;
    };
  };
}

export const UnifiedEventDetails: React.FC = () => {
  // Initialize services
  const serviceRegistry = UnifiedServiceRegistry.getInstance();
  const predictionService = serviceRegistry.getService<UnifiedPredictionService>('prediction');
  const analyticsService = serviceRegistry.getService<UnifiedAnalyticsService>('analytics');
  const stateService = serviceRegistry.getService<UnifiedStateService>('state');
  const notificationService =
    serviceRegistry.getService<UnifiedNotificationService>('notification');
  const errorService = serviceRegistry.getService<UnifiedErrorService>('error');

  // Router hooks
  const { eventId } = useParams<{ eventId: string }>();

  // State
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [showBetModal, setShowBetModal] = useState(false);
  const [selectedSelection, setSelectedSelection] = useState<Selection | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'markets' | 'statistics' | 'predictions'>(
    'overview'
  );

  // Load event data
  useEffect(() => {
    if (eventId) {
      loadEventData(eventId);
    }
  }, [eventId]);

  const loadEventData = async (id: string) => {
    try {
      setLoading(true);
      const [eventData, predictions] = await Promise.all([
        analyticsService.getEventDetails(id),
        predictionService.getEventPredictions(id),
      ]);
      setEvent({ ...eventData, predictions });
    } catch (error) {
      handleError('Failed to load event data', error);
    } finally {
      setLoading(false);
    }
  };

  const handleError = (message: string, error: any) => {
    setError(message);
    setToast({ message, type: 'error' });
    errorService.handleError(error, {
      code: 'EVENT_DETAILS_ERROR',
      source: 'UnifiedEventDetails',
      details: { message },
    });
  };

  const formatOdds = (odds: number) => {
    return odds.toFixed(2);
  };

  const formatPercentage = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100);
  };

  const getStatusBadge = (status: Event['status']) => {
    const variants = {
      upcoming: 'info',
      live: 'success',
      ended: 'secondary',
      cancelled: 'danger',
    };
    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="large" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600">Event Not Found</h2>
            <p className="mt-2 text-gray-600">The requested event could not be found.</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        {/* Event Header */}
        <Card className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img
                alt={event.homeTeam.name}
                className="w-16 h-16 object-contain"
                src={event.homeTeam.logo}
              />
              <div>
                <h1 className="text-2xl font-bold">{event.name}</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {event.competition} • {event.sport}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {getStatusBadge(event.status)}
              <p className="text-gray-600 dark:text-gray-400">
                {new Date(event.startTime).toLocaleString()}
              </p>
            </div>
          </div>
        </Card>

        {/* Navigation Tabs */}
        <Tabs className="mb-8" value={activeTab} onChange={setActiveTab}>
          <Tab label="Overview" value="overview" />
          <Tab label="Markets" value="markets" />
          <Tab label="Statistics" value="statistics" />
          <Tab label="Predictions" value="predictions" />
        </Tabs>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Teams */}
            <Card>
              <h2 className="text-xl font-bold mb-4">Teams</h2>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      alt={event.homeTeam.name}
                      className="w-12 h-12 object-contain"
                      src={event.homeTeam.logo}
                    />
                    <div>
                      <h3 className="font-medium">{event.homeTeam.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Win Rate: {formatPercentage(event.homeTeam.stats.winRate)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{event.homeTeam.stats.goalsScored} Goals</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {event.homeTeam.stats.cleanSheets} Clean Sheets
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <img
                      alt={event.awayTeam.name}
                      className="w-12 h-12 object-contain"
                      src={event.awayTeam.logo}
                    />
                    <div>
                      <h3 className="font-medium">{event.awayTeam.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Win Rate: {formatPercentage(event.awayTeam.stats.winRate)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{event.awayTeam.stats.goalsScored} Goals</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {event.awayTeam.stats.cleanSheets} Clean Sheets
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Venue & Weather */}
            <Card>
              <h2 className="text-xl font-bold mb-4">Venue & Weather</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Venue</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    {event.venue.name}, {event.venue.city}, {event.venue.country}
                  </p>
                </div>
                {event.weather && (
                  <div>
                    <h3 className="font-medium">Weather</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Condition</p>
                        <p>{event.weather.condition}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Temperature</p>
                        <p>{event.weather.temperature}°C</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Wind Speed</p>
                        <p>{event.weather.windSpeed} km/h</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Precipitation</p>
                        <p>{event.weather.precipitation}%</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Head to Head */}
            <Card>
              <h2 className="text-xl font-bold mb-4">Head to Head</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{event.statistics.headToHead.homeWins}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Home Wins</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{event.statistics.headToHead.draws}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Draws</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{event.statistics.headToHead.awayWins}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Away Wins</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Last 5 Meetings</h3>
                  <div className="space-y-2">
                    {event.statistics.headToHead.lastFive.map((match, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                      >
                        <div className="flex-1">{match.homeTeam}</div>
                        <div className="px-4 font-medium">{match.score}</div>
                        <div className="flex-1 text-right">{match.awayTeam}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Form & Trends */}
            <Card>
              <h2 className="text-xl font-bold mb-4">Form & Trends</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Recent Form</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {event.homeTeam.name}
                      </p>
                      <div className="flex space-x-1">
                        {event.statistics.form.home.lastFive.map((result, index) => (
                          <Badge
                            key={index}
                            variant={
                              result === 'W' ? 'success' : result === 'D' ? 'warning' : 'danger'
                            }
                          >
                            {result}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {event.awayTeam.name}
                      </p>
                      <div className="flex space-x-1">
                        {event.statistics.form.away.lastFive.map((result, index) => (
                          <Badge
                            key={index}
                            variant={
                              result === 'W' ? 'success' : result === 'D' ? 'warning' : 'danger'
                            }
                          >
                            {result}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Trends</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Over/Under 2.5</p>
                      <p className="font-medium">
                        Over: {formatPercentage(event.statistics.trends.overUnder.over2_5)} • Under:{' '}
                        {formatPercentage(event.statistics.trends.overUnder.under2_5)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Both Teams to Score
                      </p>
                      <p className="font-medium">
                        Yes: {formatPercentage(event.statistics.trends.bothTeamsToScore.yes)} • No:{' '}
                        {formatPercentage(event.statistics.trends.bothTeamsToScore.no)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Markets Tab */}
        {activeTab === 'markets' && (
          <div className="space-y-8">
            {event.markets.map(market => (
              <Card key={market.id}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">{market.name}</h2>
                  <Badge
                    variant={
                      market.status === 'open'
                        ? 'success'
                        : market.status === 'suspended'
                          ? 'warning'
                          : 'secondary'
                    }
                  >
                    {market.status.toUpperCase()}
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {market.selections.map(selection => (
                    <div key={selection.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{selection.name}</span>
                        <span className="text-lg font-bold">{formatOdds(selection.odds)}</span>
                      </div>
                      {selection.prediction && (
                        <div className="space-y-1 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Confidence</span>
                            <span>{formatPercentage(selection.prediction.confidence)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Value</span>
                            <span
                              className={
                                selection.prediction.expectedValue > 0
                                  ? 'text-green-600'
                                  : 'text-red-600'
                              }
                            >
                              {formatPercentage(selection.prediction.expectedValue)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Kelly</span>
                            <span>{formatPercentage(selection.prediction.kellyFraction)}</span>
                          </div>
                        </div>
                      )}
                      <Button
                        className="w-full mt-4"
                        disabled={market.status !== 'open'}
                        variant="primary"
                        onClick={() => {
                          setSelectedMarket(market);
                          setSelectedSelection(selection);
                          setShowBetModal(true);
                        }}
                      >
                        Place Bet
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Statistics Tab */}
        {activeTab === 'statistics' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Team Statistics */}
            <Card>
              <h2 className="text-xl font-bold mb-4">Team Statistics</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">{event.homeTeam.name}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Goals Scored</span>
                      <span>{event.statistics.form.home.goalsScored}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Goals Conceded</span>
                      <span>{event.statistics.form.home.goalsConceded}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Clean Sheets</span>
                      <span>{event.homeTeam.stats.cleanSheets}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Win Rate</span>
                      <span>{formatPercentage(event.homeTeam.stats.winRate)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">{event.awayTeam.name}</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Goals Scored</span>
                      <span>{event.statistics.form.away.goalsScored}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Goals Conceded</span>
                      <span>{event.statistics.form.away.goalsConceded}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Clean Sheets</span>
                      <span>{event.awayTeam.stats.cleanSheets}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Win Rate</span>
                      <span>{formatPercentage(event.awayTeam.stats.winRate)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Match Statistics */}
            <Card>
              <h2 className="text-xl font-bold mb-4">Match Statistics</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-medium mb-2">Goals</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Average Goals per Game</span>
                      <span>{event.statistics.trends.overUnder.averageGoals.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Over 2.5 Goals</span>
                      <span>{formatPercentage(event.statistics.trends.overUnder.over2_5)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Under 2.5 Goals</span>
                      <span>{formatPercentage(event.statistics.trends.overUnder.under2_5)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Both Teams to Score</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Yes</span>
                      <span>{formatPercentage(event.statistics.trends.bothTeamsToScore.yes)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>No</span>
                      <span>{formatPercentage(event.statistics.trends.bothTeamsToScore.no)}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium mb-2">First Half</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Home Wins</span>
                      <span>{formatPercentage(event.statistics.trends.firstHalf.homeWins)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Away Wins</span>
                      <span>{formatPercentage(event.statistics.trends.firstHalf.awayWins)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Draws</span>
                      <span>{formatPercentage(event.statistics.trends.firstHalf.draws)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Predictions Tab */}
        {activeTab === 'predictions' && (
          <div className="space-y-8">
            {event.predictions.map((prediction, index) => (
              <Card key={index}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">
                    {prediction.marketType} - {prediction.selection}
                  </h2>
                  <Badge
                    variant={
                      prediction.expectedValue > 0
                        ? 'success'
                        : prediction.expectedValue < 0
                          ? 'danger'
                          : 'warning'
                    }
                  >
                    {formatPercentage(prediction.expectedValue)} Expected Value
                  </Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-2">Prediction Details</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Confidence</span>
                        <span>{formatPercentage(prediction.confidence)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Expected Value</span>
                        <span
                          className={
                            prediction.expectedValue > 0 ? 'text-green-600' : 'text-red-600'
                          }
                        >
                          {formatPercentage(prediction.expectedValue)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Kelly Fraction</span>
                        <span>{formatPercentage(prediction.kellyFraction)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Factors</h3>
                    <div className="space-y-2">
                      {prediction.factors.map((factor, factorIndex) => (
                        <div key={factorIndex} className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <div className="flex justify-between mb-1">
                            <span className="font-medium">{factor.name}</span>
                            <span className={factor.impact > 0 ? 'text-green-600' : 'text-red-600'}>
                              {formatPercentage(factor.impact)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {factor.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Bet Modal */}
      <Modal isOpen={showBetModal} title="Place Bet" onClose={() => setShowBetModal(false)}>
        {selectedMarket && selectedSelection && (
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">Bet Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Market</span>
                  <span>{selectedMarket.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Selection</span>
                  <span>{selectedSelection.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Odds</span>
                  <span>{formatOdds(selectedSelection.odds)}</span>
                </div>
              </div>
            </div>
            {selectedSelection.prediction && (
              <div>
                <h3 className="font-medium mb-2">Prediction</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Confidence</span>
                    <span>{formatPercentage(selectedSelection.prediction.confidence)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Expected Value</span>
                    <span
                      className={
                        selectedSelection.prediction.expectedValue > 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }
                    >
                      {formatPercentage(selectedSelection.prediction.expectedValue)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Recommended Stake</span>
                    <span>{formatPercentage(selectedSelection.prediction.kellyFraction)}</span>
                  </div>
                </div>
              </div>
            )}
            <div>
              <h3 className="font-medium mb-2">Stake</h3>
              <Input min="0" placeholder="Enter stake amount" step="0.01" type="number" />
            </div>
            <div className="flex justify-end space-x-4">
              <Button variant="secondary" onClick={() => setShowBetModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  // Handle bet placement
                  setShowBetModal(false);
                }}
              >
                Place Bet
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Toast Notifications */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
