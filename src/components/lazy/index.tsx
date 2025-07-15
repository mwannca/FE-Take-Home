import React, { lazy, Suspense } from 'react';
import { LoadingSpinner } from '@/components/common';

// Lazy load heavy components that are not immediately needed
export const LazyFruitDetailsModal = lazy(() => import('@/components/common/FruitDetailsModal'));

// Loading fallback component
const LazyLoadingFallback = ({ message = 'Loading...' }: { message?: string }) => (
  <div className="flex items-center justify-center p-8">
    <LoadingSpinner size="small" message={message} />
  </div>
);

// Higher-order component for lazy loading with fallback
export const withLazyLoading = <P extends object>(
  Component: React.ComponentType<P>,
  fallbackMessage?: string
) => {
  return (props: P) => (
    <Suspense fallback={<LazyLoadingFallback message={fallbackMessage} />}>
      <Component {...props} />
    </Suspense>
  );
};

// Export lazy components with fallbacks
export const FruitDetailsModal = withLazyLoading(LazyFruitDetailsModal, 'Loading fruit details...'); 