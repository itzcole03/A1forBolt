import React from 'react';
import { useConfigFlags } from '../hooks/useConfigFlags';
import { useEventBus } from '../hooks/useEventBus';

export const DebugPanel: React.FC = () => {
  const flags = useConfigFlags();
  const recentEvents = useEventBus().recentEvents;

  return (
    <div className="debug-panel p-4 bg-gray-800 text-white text-sm fixed bottom-0 right-0 w-96 max-h-96 overflow-auto z-50">
      <h2 className="font-bold mb-2">Debug Panel</h2>
      <div>
        <h3 className="underline mb-1">Config Flags</h3>
        <pre>{JSON.stringify(flags, null, 2)}</pre>
      </div>
      <div className="mt-4">
        <h3 className="underline mb-1">Recent EventBus Emissions</h3>
        <pre>{JSON.stringify(recentEvents, null, 2)}</pre>
      </div>
    </div>
  );
};
