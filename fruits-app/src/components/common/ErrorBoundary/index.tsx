import React, { Component, ErrorInfo, ReactNode } from 'react';
import { sentryManager } from '@/utils/sentry';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  retryCount: number;
  isRetrying: boolean;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  maxRetries?: number;
  retryDelay?: number;
  showDetails?: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeout: NodeJS.Timeout | null = null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRetrying: false,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error);
      console.error('Error info:', errorInfo);
    }

    // Report to Sentry
    sentryManager.captureException(error, {
      component: 'ErrorBoundary',
      action: 'component_did_catch',
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
    });

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentWillUnmount() {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  handleRetry = () => {
    const { maxRetries = 3, retryDelay = 1000 } = this.props;
    const { retryCount } = this.state;

    if (retryCount >= maxRetries) {
      console.error('Max retries exceeded');
      return;
    }

    this.setState({ isRetrying: true });

    this.retryTimeout = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: retryCount + 1,
        isRetrying: false,
      });
    }, retryDelay);
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRetrying: false,
    });
  };

  render() {
    const { hasError, error, errorInfo, retryCount, isRetrying } = this.state;
    const { children, fallback, maxRetries = 3, showDetails = process.env.NODE_ENV === 'development' } = this.props;

    if (hasError) {
      // Custom fallback UI
      if (fallback) {
        return fallback;
      }

      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>

            <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
              Something went wrong
            </h2>
            
            <p className="text-gray-600 text-center mb-6">
              We're sorry, but something unexpected happened. Please try again.
            </p>

            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                disabled={isRetrying || retryCount >= maxRetries}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:cursor-not-allowed"
              >
                {isRetrying ? 'Retrying...' : `Try Again (${retryCount}/${maxRetries})`}
              </button>

              <button
                onClick={this.handleReset}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Reset
              </button>

              {showDetails && error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                    Show Error Details
                  </summary>
                  <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-800 overflow-auto max-h-40">
                    <div className="mb-2">
                      <strong>Error:</strong> {error.message}
                    </div>
                    {errorInfo && (
                      <div>
                        <strong>Component Stack:</strong>
                        <pre className="mt-1 whitespace-pre-wrap">{errorInfo.componentStack}</pre>
                      </div>
                    )}
                    <div className="mt-2">
                      <strong>Stack Trace:</strong>
                      <pre className="mt-1 whitespace-pre-wrap">{error.stack}</pre>
                    </div>
                  </div>
                </details>
              )}

              <div className="text-xs text-gray-500 text-center mt-4">
                <p>If this problem persists, please contact support.</p>
                <p className="mt-1">Error ID: {error?.name || 'Unknown'}</p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

export default ErrorBoundary; 