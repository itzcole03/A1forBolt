import ErrorBoundary from './ErrorBoundary';
import React from 'react';



interface WithErrorBoundaryOptions {
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export function withErrorBoundary<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  options: WithErrorBoundaryOptions = {}
) {
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';

  function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary>
        <WrappedComponent {...props} />
      </ErrorBoundary>
    );
  }

  WithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;

  return WithErrorBoundary;
}

// Example usage:
// const SafeComponent = withErrorBoundary(RiskyComponent, {
//   fallback: <CustomErrorFallback />,
//   onError: (error, errorInfo) => {
//     // Log to error tracking service
//     console.error('Component error:', error, errorInfo);
//   }
// }); 