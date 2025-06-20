# Service Status & Feature Flag Integration

All core backend services (Analytics, ESPN, Odds, News, Weather, Injuries, Real-Time Updates) report their health status to the global `window.appStatus` object. Each service writes to a unique key (e.g., `window.appStatus.news`), providing:

- `connected`: boolean (true if service is online)
- `quality`: number (0–1, representing connection/data quality)
- `timestamp`: number (last status update, ms since epoch)

The frontend dashboard displays these statuses using the `ServiceStatusIndicators` component.

Feature flags are checked dynamically via the `isFeatureEnabled` utility and can be surfaced in the UI for admin/ops transparency.

## Example

```js
window.appStatus = {
  news: { connected: true, quality: 1, timestamp: 1728595600000 },
  realtime: { connected: false, quality: 0, timestamp: 1728595600000 },
  // ...
}
```

## Usage in the Dashboard

1. **Import the component:**
   ```tsx
   import { ServiceStatusIndicators } from '../components/ui/ServiceStatusIndicators';
   ```
2. **Place it near the top of your dashboard:**
   ```tsx
   <ServiceStatusIndicators />
   ```

This will display a grid of service statuses, updating every 2 seconds.

## Adding New Services

- Ensure your new service writes its status to `window.appStatus.<serviceKey>`.
- Add the service key to the `SERVICE_KEYS` array in `ServiceStatusIndicators.tsx`.
- Optionally, add a feature flag and surface its status in the UI as well.

## Feature Flags

- Use the `isFeatureEnabled('<FEATURE>')` utility to check if a feature is enabled.
- You may display feature flag statuses in the dashboard for transparency.

## Example Feature Flag UI Snippet

```tsx
import { isFeatureEnabled } from '../../services/configService.js';

const features = [
  'INJURIES', 'NEWS', 'WEATHER', 'REALTIME', 'ESPN', 'ODDS', 'ANALYTICS'
];

export const FeatureFlagIndicators = () => {
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
```
