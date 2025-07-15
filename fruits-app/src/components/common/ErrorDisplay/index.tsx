import React, { memo } from 'react';
import { ErrorDisplayProps } from '@/types';

const ErrorDisplay = memo(({ error, onRetry }: ErrorDisplayProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg border border-red-200" role="alert" aria-live="assertive">
      <div className="text-4xl mb-4" aria-hidden="true">⚠️</div>
      <h3 className="text-xl font-semibold text-red-800 mb-2">Something went wrong</h3>
      <p className="text-red-600 mb-6 text-center">{error}</p>
      {onRetry && (
        <button 
          className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          onClick={onRetry}
          aria-label="Try again to load fruits"
        >
          Try Again
        </button>
      )}
    </div>
  );
});

ErrorDisplay.displayName = 'ErrorDisplay';

export default ErrorDisplay; 