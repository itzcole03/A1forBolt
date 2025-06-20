import React, { useState } from 'react';
import GlassCard from '../components/ui/GlassCard';
import GlowButton from '../components/ui/GlowButton';
import Tooltip from '../components/ui/Tooltip';
import { analyticsService } from '@/services/analytics';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';

const timeRanges = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: '365', label: 'Last year' },
];

const Trends: React.FC = () => {
  const [selectedSport, setSelectedSport] = useState('all');
  const [selectedMarket, setSelectedMarket] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('30');

  const { data: performanceData, isLoading: performanceLoading, error: performanceError } = useQuery({
    queryKey: ['performance', selectedTimeRange],
    queryFn: () => analyticsService.getPerformanceTrends(selectedTimeRange),
  });
  const { data: sportsData, isLoading: sportsLoading, error: sportsError } = useQuery({
    queryKey: ['sports', selectedSport, selectedTimeRange],
    queryFn: () => analyticsService.getSportsDistribution(selectedSport, selectedTimeRange),
  });
  const { data: marketsData, isLoading: marketsLoading, error: marketsError } = useQuery({
    queryKey: ['markets', selectedMarket, selectedTimeRange],
    queryFn: () => analyticsService.getMarketsDistribution(selectedMarket, selectedTimeRange),
  });

  const handleSportChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSport(event.target.value);
  };
  const handleMarketChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedMarket(event.target.value);
  };
  const handleTimeRangeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedTimeRange(event.target.value);
  };

  if (performanceError || sportsError || marketsError) {
    return <ErrorMessage error={performanceError || sportsError || marketsError} />;
  }

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-purple-100 to-blue-50 dark:from-gray-900 dark:to-blue-950">
      <GlassCard className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-100">Trends</h1>
          <select className="modern-input" value={selectedTimeRange} onChange={handleTimeRangeChange}>
            {timeRanges.map(range => (
              <option key={range.value} value={range.value}>{range.label}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <GlassCard>
            <h2 className="text-lg font-semibold mb-2">Performance Trends</h2>
            {performanceLoading ? (
              <div className="flex justify-center items-center h-64"><span>Loading...</span></div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer height="100%" width="100%">
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Line dataKey="value" stroke="#8884d8" strokeWidth={2} type="monotone" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </GlassCard>
          <GlassCard>
            <h2 className="text-lg font-semibold mb-2">Sports Distribution</h2>
            <select className="modern-input mb-2" value={selectedSport} onChange={handleSportChange}>
              <option value="all">All Sports</option>
              <option value="football">Football</option>
              <option value="basketball">Basketball</option>
              <option value="tennis">Tennis</option>
            </select>
            {sportsLoading ? (
              <div className="flex justify-center items-center h-64"><span>Loading...</span></div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer height="100%" width="100%">
                  <BarChart data={sportsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </GlassCard>
          <GlassCard>
            <h2 className="text-lg font-semibold mb-2">Market Distribution</h2>
            <select className="modern-input mb-2" value={selectedMarket} onChange={handleMarketChange}>
              <option value="all">All Markets</option>
              <option value="match-winner">Match Winner</option>
              <option value="over-under">Over/Under</option>
              <option value="btts">Both Teams to Score</option>
            </select>
            {marketsLoading ? (
              <div className="flex justify-center items-center h-64"><span>Loading...</span></div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer height="100%" width="100%">
                  <BarChart data={marketsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </GlassCard>
        </div>
        <GlassCard>
          <h2 className="text-lg font-semibold mb-4">Key Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <TrendingUpIcon className="text-green-500" />
              <div>
                <div className="font-medium">Most Profitable Sport</div>
                <div>Football</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TrendingDownIcon className="text-red-500" />
              <div>
                <div className="font-medium">Least Profitable Market</div>
                <div>Handicap</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TrendingUpIcon className="text-green-500" />
              <div>
                <div className="font-medium">Best Time to Bet</div>
                <div>Weekend Matches</div>
              </div>
            </div>
          </div>
        </GlassCard>
      </GlassCard>
    </div>
  );
};

export default Trends;
