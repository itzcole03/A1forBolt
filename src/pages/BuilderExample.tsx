import React from 'react';
import { BuilderPage } from '../components/builder';

const BuilderExample: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-900 dark:text-white">
          Builder.io Integration Example
        </h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Dynamic Content Area
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            This area can be edited visually using Builder.io. Replace this with Builder content.
          </p>
          
          {/* Builder.io page content will render here */}
          <BuilderPage 
            model="page" 
            url="/builder-example"
          />
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Instructions
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-300">
            <li>Set up your Builder.io API key in <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">src/config/builder.ts</code></li>
            <li>Create a page model in Builder.io with URL pattern <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">/builder-example</code></li>
            <li>Set your preview URL to <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">http://localhost:5174</code></li>
            <li>Start editing content in Builder.io and see it update live!</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default BuilderExample;
