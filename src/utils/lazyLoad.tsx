import React, { Suspense } from 'react';

interface LazyLoadProps {
  fallback?: React.ReactNode;
}

export const lazyLoad = (
  importFunc: () => Promise<{ default: React.ComponentType<any> }>,
  fallback: React.ReactNode = null
) => {
  const LazyComponent = React.lazy(importFunc);

  return (props: any) => (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
};
