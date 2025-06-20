import React from 'react';
import { isFeatureEnabled } from '../../services/configService.js';

const features = [
  'INJURIES', 'NEWS', 'WEATHER', 'REALTIME', 'ESPN', 'ODDS', 'ANALYTICS'
];

/**
 * Displays the enabled/disabled state of all major feature flags.
 * Uses isFeatureEnabled to dynamically query each flag.
 */
export const FeatureFlagIndicators: React.FC = () => {
  const [flags, setFlags] = React.useState<{ [key: string]: boolean }>({});

  React.useEffect(() => {
    const fetchFlags = async () => {
      const results: { [key: string]: boolean } = {};
      for (const feature of features) {
        results[feature] = await isFeatureEnabled(feature);
      }
      setFlags(results);
    };
    fetchFlags();
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {features.map(key => (
        <div key={key} className="p-4 border rounded-lg bg-white dark:bg-gray-900">
          <div className="font-semibold">{key}</div>
          <span className={flags[key] ? 'text-green-600' : 'text-red-600'}>
            {flags[key] ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      ))}
    </div>
  );
};
