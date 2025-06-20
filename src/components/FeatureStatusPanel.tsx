import React, { useEffect, useState } from 'react';
import { UnifiedConfig } from '../unified/UnifiedConfig.js';
import { EventBus } from '../unified/EventBus.js';

import type { Config } from '../unified/UnifiedConfig.js';

const FEATURES: { key: keyof Config; label: string }[] = [
  { key: 'enablePvPModel', label: 'PvP Matchup Model' },
  { key: 'enablePlayerFormModel', label: 'Player Form Model' },
  { key: 'enableVenueEffectModel', label: 'Venue Effect Model' },
  { key: 'enableRefereeImpactModel', label: 'Referee Impact Model' },
  { key: 'enableLineupSynergyModel', label: 'Lineup Synergy Model' },
  { key: 'enableNews', label: 'News Service' },
  { key: 'enableWeather', label: 'Weather Service' },
  { key: 'enableInjuries', label: 'Injury Feed' },
  { key: 'enableAnalytics', label: 'Analytics Engine' },
  { key: 'enableSocialSentiment', label: 'Social Sentiment' }
];

export const FeatureStatusPanel: React.FC = () => {
  const [statuses, setStatuses] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const config = UnifiedConfig.getInstance();
    const initialStatuses: Record<string, boolean> = {};
    FEATURES.forEach(({ key }) => {
      const flag = config.get(key) as { enabled: boolean };
      initialStatuses[key] = Boolean(flag && flag.enabled);
    });
    setStatuses(initialStatuses);

    const handler = () => {
      const updated: Record<string, boolean> = {};
      FEATURES.forEach(({ key }) => {
        const flag = config.get(key) as { enabled: boolean };
        updated[key] = Boolean(flag && flag.enabled);
      });
      setStatuses(updated);
    };

    const eventBus = EventBus.getInstance();
    eventBus.on('config:update', handler);
    return () => {
      eventBus.off('config:update', handler);
    };
  }, []);

  return (
    <div className="bg-white shadow rounded-lg p-6 w-full max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Feature Status</h2>
      <ul className="divide-y divide-gray-200">
        {FEATURES.map(({ key, label }) => (
          <li key={key} className="flex items-center justify-between py-2">
            <span className="font-medium text-gray-700">{label}</span>
            <span
              className={
                statuses[key]
                  ? 'px-2 py-1 text-xs rounded bg-green-100 text-green-800'
                  : 'px-2 py-1 text-xs rounded bg-red-100 text-red-800'
              }
            >
              {statuses[key] ? 'Enabled' : 'Disabled'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FeatureStatusPanel;
