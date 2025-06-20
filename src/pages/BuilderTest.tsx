import React, { useEffect, useState } from 'react';
import { builder, BuilderComponent } from '@builder.io/react';

// A simple test component to debug Builder.io integration
const BuilderTest: React.FC = () => {
  const [builderContentJson, setBuilderContentJson] = useState(null);
  const [debugStatus, setDebugStatus] = useState({
    apiKey: builder.apiKey,
    isEditing: builder.isEditing,
    userAgent: navigator.userAgent,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight
  });

  useEffect(() => {
    // Output debug info to console
    console.log('[Builder.io DEBUG] Initializing with API key:', builder.apiKey);
    console.log('[Builder.io DEBUG] User attributes:', builder.getUserAttributes());
    console.log('[Builder.io DEBUG] Environment:', builder);

    // Fetch test content
    async function fetchBuilderContent() {
      try {
        const content = await builder.get('page')
          .promise();
        
        console.log('[Builder.io DEBUG] Content result:', content);
        setBuilderContentJson(content);
      } catch (error) {
        console.error('[Builder.io DEBUG] Error fetching content:', error);
      }
    }
    
    fetchBuilderContent();

    // Create global debug helper
    window.BUILDER_DEBUG = {
      forcePreview: () => {
        builder.setUserAttributes({ ...builder.getUserAttributes(), preview: true });
        console.log('[Builder.io DEBUG] Preview mode forced');
        return 'Preview mode enabled';
      },
      disableTracking: () => {
        // @ts-ignore
        builder.canTrack = false;
        console.log('[Builder.io DEBUG] Tracking disabled');
        return 'Tracking disabled';
      },
      getRegistry: () => {
        console.log('[Builder.io DEBUG] Component registry:', builder.registry);
        return builder.registry;
      },
      dumpStatus: () => {
        const status = {
          apiKey: builder.apiKey,
          isEditing: builder.isEditing,
          components: Object.keys(builder.registry).length,
          userAttributes: builder.getUserAttributes()
        };
        console.log('[Builder.io DEBUG] Current status:', status);
        return status;
      }
    };
  }, []);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="bg-blue-50 p-4 mb-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Builder.io Debug Page</h1>
        <p className="text-gray-600 mb-4">This page helps debug Builder.io integration issues</p>
        
        <div className="bg-white p-4 rounded shadow mb-4">
          <h2 className="font-medium mb-2">Debug Status</h2>
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
            {JSON.stringify(debugStatus, null, 2)}
          </pre>
        </div>

        <div className="bg-white p-4 rounded shadow mb-4">
          <h2 className="font-medium mb-2">Debug Commands</h2>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li><code>BUILDER_DEBUG.forcePreview()</code> - Force preview mode</li>
            <li><code>BUILDER_DEBUG.disableTracking()</code> - Disable tracking features</li>
            <li><code>BUILDER_DEBUG.getRegistry()</code> - Show all registered components</li>
            <li><code>BUILDER_DEBUG.dumpStatus()</code> - Output current Builder.io status</li>
          </ul>
        </div>
      </div>

      <div className="border-2 border-dashed border-gray-300 p-6 rounded-lg">
        <h2 className="font-bold mb-4">Builder.io Content Area:</h2>
        <BuilderComponent model="page" content={builderContentJson} />
      </div>
    </div>
  );
};

export default BuilderTest;
