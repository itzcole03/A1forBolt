import React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import Box from '@mui/material/Box';
import { Chart, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip as ChartTooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useUnifiedAnalytics } from '../../hooks/useUnifiedAnalytics.js'; // Add .js extension if required by tsconfig
import { useTheme } from '../../hooks/useTheme.js';
// If the following import fails, see the comment below for a dynamic workaround
// If you see TypeScript errors for icon imports below, ensure your react-icons version is >=5.5.0 and your tsconfig.json includes "esModuleInterop": true and "allowSyntheticDefaultImports": true. If problems persist, use a dynamic import workaround (see comment below).
// Example dynamic icon usage: const Icon = require('react-icons/fa').FaRobot;
import { FaRobot, FaBolt, FaArrowUp, FaArrowDown, FaHeartbeat, FaExclamationTriangle } from 'react-icons/fa';



Chart.register(ArcElement, BarElement, CategoryScale, LinearScale, ChartTooltip, Legend);

// Helper: Status chip
interface StatusChipProps {
  label: string;
  color: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  icon?: React.ReactElement;
}
const StatusChip: React.FC<StatusChipProps> = ({ label, color, icon }) => (
  <Chip icon={icon} label={label} color={color} size="small" sx={{ mr: 1, mb: 1 }} />
);

const AdvancedAnalytics: React.FC = () => {
  const theme = useTheme();
  // Use the unified analytics hook
  const { ml, performance } = useUnifiedAnalytics();

  // --- Types removed for build robustness. If you want to restore strict typing, define interfaces for your analytics slices. ---
  const enhancedAnalysis = (ml?.data || {}) as any;
  const loading: boolean = ml?.loading || false;
  const error: string | null = ml?.error || null;
  const modelStatus = (performance?.data?.[0] || {}) as any;
  const lastUpdate: string = performance?.data?.[0]?.timestamp || '';
  const fallbackActive: boolean = false; // Set as needed or infer from data
  const simulationMode: boolean = false; // Set as needed or infer from data

  // Only assign these from enhancedAnalysis (not from drift/realtime) to avoid duplicate declarations
  const sentiment = enhancedAnalysis.sentiment || {};
  const odds = enhancedAnalysis.marketData?.odds || {};
  const consensus = enhancedAnalysis.marketData?.consensus || {};
  const injuries = enhancedAnalysis.injuries || [];
  const patterns = enhancedAnalysis.patterns || [];
  const explainability = enhancedAnalysis.explainability || {};
  const aiStatus = modelStatus || {};

  // THEME: Replace theme.palette.* with hardcoded values for now
  const primaryColor = theme.theme === 'dark' ? '#1976d2' : '#1976d2'; // fallback to MUI blue
  const textColor = theme.theme === 'dark' ? '#fff' : '#222';

  // Local loading overlay
  if (loading || !enhancedAnalysis) {
    return (
      <Box className="flex flex-col items-center justify-center min-h-[300px]">
        <CircularProgress />
        <Typography variant="body2" className="mt-2 text-gray-400">Loading advanced analytics...</Typography>
      </Box>
    );
  }

  // Sentiment, Odds/Consensus, Injuries, Patterns, Explainability, and Model status are all defined above and should not be redeclared here.
  // (Removed duplicate declarations)

  return (
    <Box className="w-full max-w-6xl mx-auto p-4">
      <Grid container spacing={2}>
        {/* Model/AI status */}
        <Grid item xs={12} md={4}>
          <Card className="bg-gray-900 text-white dark:bg-gray-800">
            <CardContent>
              <Typography variant="h6" gutterBottom><FaRobot className="inline mr-2" />AI Model Status</Typography>
              <StatusChip label={`Status: ${aiStatus.status || 'Unknown'}`} color={aiStatus.status === 'Online' ? 'success' : 'warning'} icon={<FaRobot />} />
              <StatusChip label={`Accuracy: ${aiStatus.accuracy ? `${(aiStatus.accuracy * 100).toFixed(1)}%` : 'N/A'}`} color="info" icon={<FaBolt />} />
              <StatusChip label={`Confidence: ${aiStatus.confidence ? `${(aiStatus.confidence * 100).toFixed(1)}%` : 'N/A'}`} color="primary" icon={<FaBolt />} />
              <Typography variant="caption" className="block mt-2 text-gray-400">Last update: {lastUpdate ? new Date(lastUpdate).toLocaleTimeString() : 'N/A'}</Typography>
              {simulationMode && <StatusChip label="Simulation Mode" color="warning" icon={<FaExclamationTriangle />} />}
              {fallbackActive && <StatusChip label="Fallback Active" color="error" icon={<FaExclamationTriangle />} />}
              {error && <Typography color="error" variant="body2">{error}</Typography>}
            </CardContent>
          </Card>
        </Grid>
        {/* Sentiment & Consensus */}
        <Grid item xs={12} md={4}>
          <Card className="bg-gray-900 text-white dark:bg-gray-800">
            <CardContent>
              <Typography variant="h6" gutterBottom><FaHeartbeat className="inline mr-2" />Social Sentiment & Consensus</Typography>
              <Typography variant="body2">Score: <b>{sentiment.score ?? 'N/A'}</b></Typography>
              <Typography variant="body2">Volume: <b>{sentiment.volume ?? 'N/A'}</b></Typography>
              <Typography variant="body2">Trending: <b>{sentiment.trending ? 'Yes' : 'No'}</b></Typography>
              <Typography variant="body2">Keywords: {sentiment.keywords?.length ? sentiment.keywords.join(', ') : 'N/A'}</Typography>
              <Box className="mt-2">
                <Typography variant="body2">Consensus: Over <b>{consensus.overPercentage ?? 'N/A'}%</b> / Under <b>{consensus.underPercentage ?? 'N/A'}%</b></Typography>
              </Box>
              {/* Odds */}
              <Box className="mt-2">
                <Typography variant="body2">Odds:</Typography>
                <Typography variant="caption">Moneyline: {odds.moneyline ?? 'N/A'} | Spread: {odds.spread ?? 'N/A'} | Total: {odds.total ?? 'N/A'}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        {/* Pattern Recognition & Injuries */}
        <Grid item xs={12} md={4}>
          <Card className="bg-gray-900 text-white dark:bg-gray-800">
            <CardContent>
              <Typography variant="h6" gutterBottom><FaArrowUp className="inline mr-2" />Pattern Recognition & Injuries</Typography>
              {patterns.length > 0 ? (
                <Box>
                  {patterns.map((p: any, idx: number) => (
                    <StatusChip key={idx} label={p.label} color={p.positive ? 'success' : 'default'} icon={p.positive ? <FaArrowUp /> : <FaArrowDown />} />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2">No significant patterns detected.</Typography>
              )}
              <Box className="mt-2">
                <Typography variant="body2">Injuries:</Typography>
                {injuries.length > 0 ? injuries.map((inj: any, idx: number) => (
                  <Typography key={idx} variant="caption">{inj.player}: {inj.status} (Impact: {inj.impact})</Typography>
                )) : <Typography variant="caption">No major injuries reported.</Typography>}
              </Box>
            </CardContent>
          </Card>
        </Grid>
        {/* Explainability (SHAP/Feature Importances) */}
        <Grid item xs={12} md={6}>
          <Card className="bg-gray-900 text-white dark:bg-gray-800 mt-4">
            <CardContent>
              <Typography variant="h6" gutterBottom>Model Explainability</Typography>
              {explainability.featureImportances ? (
                <Bar
                  data={{
                    labels: Object.keys(explainability.featureImportances),
                    datasets: [{
                      label: 'Feature Importance',
                      data: Object.values(explainability.featureImportances),
                      backgroundColor: primaryColor,
                    }],
                  }}
                  options={{
                    plugins: { legend: { display: false } },
                    responsive: true,
                    scales: { x: { ticks: { color: textColor } }, y: { ticks: { color: textColor } } },
                  }}
                />
              ) : <Typography variant="body2">No explainability data available.</Typography>}
            </CardContent>
          </Card>
        </Grid>
        {/* Risk & Confidence */}
        <Grid item xs={12} md={6}>
          <Card className="bg-gray-900 text-white dark:bg-gray-800 mt-4">
            <CardContent>
              <Typography variant="h6" gutterBottom>Risk & Confidence</Typography>
              <Box className="flex flex-row flex-wrap gap-2 items-center">
                <StatusChip label={`Risk: ${enhancedAnalysis.riskLevel ?? 'N/A'}`} color="warning" icon={<FaExclamationTriangle />} />
                <StatusChip label={`Confidence: ${enhancedAnalysis.confidence ? `${(enhancedAnalysis.confidence * 100).toFixed(1)}%` : 'N/A'}`} color="primary" icon={<FaBolt />} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export { AdvancedAnalytics };
