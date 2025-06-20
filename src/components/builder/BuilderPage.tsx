import React from 'react';
import { BuilderComponent } from '@builder.io/react';
import '../../config/builder';

interface BuilderPageProps {
  model?: string;
  content?: unknown;
  url?: string;
}

const BuilderPage: React.FC<BuilderPageProps> = ({ 
  model = 'page', 
  content, 
  url 
}) => {
  return (
    <BuilderComponent
      model={model}
      content={content}
      url={url}
      // Pass any custom data or context here
      data={{
        // You can pass app-specific data to Builder components
        theme: 'betting-app',
        user: null, // Replace with actual user data if needed
      }}    />
  );
};

export default BuilderPage;
