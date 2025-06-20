import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
} from 'recharts';

interface RiskInsightsProps {
  riskMetrics: Record<string, number>;
  recommendations: {
    shouldBet: boolean;
    confidence: number;
    maxStake: number;
    expectedValue: number;
  };
  simulation: {
    distribution: number[];
    var: number;
    cvar: number;
    sharpeRatio: number;
    maxDrawdown: number;
  };
}

const RiskInsights: React.FC<RiskInsightsProps> = ({
  riskMetrics,
  recommendations,
  simulation,
}) => {
  return (
    <div className="space-y-8">
      {/* Risk Metrics Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Risk Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(riskMetrics).map(([metric, value]) => (
            <div key={metric} className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-500 capitalize">
                {metric.replace(/([A-Z])/g, ' $1').trim()}
              </h3>
              <p className="text-2xl font-bold text-gray-900">
                {typeof value === 'number' ? value.toFixed(4) : value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Recommendations Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Betting Recommendations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Should Bet</span>
              <span
                className={`px-3 py-1 rounded-full text-white ${
                  recommendations.shouldBet ? 'bg-green-500' : 'bg-red-500'
                }`}
              >
                {recommendations.shouldBet ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Confidence</span>
              <span className="font-mono">{recommendations.confidence.toFixed(2)}%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Max Stake</span>
              <span className="font-mono">${recommendations.maxStake.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Expected Value</span>
              <span
                className={`font-mono ${
                  recommendations.expectedValue >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                ${recommendations.expectedValue.toFixed(2)}
              </span>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Confidence Distribution</h3>
            <ResponsiveContainer height={200} width="100%">
              <AreaChart
                data={[
                  { x: 0, y: 0 },
                  { x: recommendations.confidence / 100, y: 1 },
                  { x: 1, y: 0 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" tickFormatter={value => `${(value * 100).toFixed(0)}%`} />
                <YAxis />
                <Tooltip />
                <Area dataKey="y" fill="#93C5FD" stroke="#3B82F6" type="monotone" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Simulation Results Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Simulation Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Risk Measures</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Value at Risk (95%)</span>
                <span className="font-mono">${simulation.var.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Conditional VaR</span>
                <span className="font-mono">${simulation.cvar.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Sharpe Ratio</span>
                <span className="font-mono">{simulation.sharpeRatio.toFixed(4)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Max Drawdown</span>
                <span className="font-mono">{(simulation.maxDrawdown * 100).toFixed(2)}%</span>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Return Distribution</h3>
            <ResponsiveContainer height={200} width="100%">
              <AreaChart
                data={simulation.distribution.map((value, index) => ({
                  x: index,
                  value,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" />
                <YAxis />
                <Tooltip />
                <Area dataKey="value" fill="#93C5FD" stroke="#3B82F6" type="monotone" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Risk Visualization Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Risk Visualization</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Risk-Return Profile</h3>
            <ResponsiveContainer height={200} width="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="risk" domain={[0, 100]} name="Risk" unit="%" />
                <YAxis dataKey="return" domain={[-100, 100]} name="Return" unit="%" />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                <Scatter
                  data={[
                    {
                      risk: simulation.var,
                      return: recommendations.expectedValue,
                    },
                  ]}
                  fill="#3B82F6"
                  name="Risk-Return"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Risk Decomposition</h3>
            <ResponsiveContainer height={200} width="100%">
              <BarChart
                data={Object.entries(riskMetrics).map(([metric, value]) => ({
                  metric,
                  value,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
};

export default React.memo(RiskInsights);
