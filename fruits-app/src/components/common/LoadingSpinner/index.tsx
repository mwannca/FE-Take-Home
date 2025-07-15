import React, { memo } from 'react';
import { LoadingSpinnerProps } from '@/types';

const LoadingSpinner = memo(({ 
  size = 'medium', 
  message = 'Loading...'
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    small: 'small',
    medium: '',
    large: 'large'
  };

  return (
    <div className={`loading-container ${sizeClasses[size]}`} role="status" aria-live="polite">
      <div className="spinner" aria-hidden="true"></div>
      <p className="loading-message">{message}</p>
    </div>
  );
});

LoadingSpinner.displayName = 'LoadingSpinner';

export default LoadingSpinner; 