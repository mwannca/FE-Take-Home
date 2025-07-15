/**
 * Sentry Configuration
 * 
 * Provides:
 * - Error tracking and reporting
 * - Performance monitoring
 * - User session tracking
 * - Release tracking
 * - Custom context and tags
 */

import * as Sentry from '@sentry/react';
import { BrowserTracing } from '@sentry/tracing';

interface SentryConfig {
  dsn: string;
  environment: string;
  release?: string;
  tracesSampleRate?: number;
  integrations?: any[];
  beforeSend?: (event: any) => any;
  beforeBreadcrumb?: (breadcrumb: any) => any;
}

class SentryManager {
  private isInitialized: boolean = false;
  private config: SentryConfig;

  constructor() {
    this.config = {
      dsn: process.env.REACT_APP_SENTRY_DSN || '',
      environment: process.env.NODE_ENV || 'development',
      release: process.env.REACT_APP_VERSION || '1.0.0',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      integrations: [
        new BrowserTracing({
          tracingOrigins: ['localhost', 'your-domain.com'],
        }),
      ],
      beforeSend: this.beforeSend.bind(this),
      beforeBreadcrumb: this.beforeBreadcrumb.bind(this),
    };
  }

  /**
   * Initialize Sentry
   */
  initialize(): void {
    if (this.isInitialized) {
      console.warn('Sentry already initialized');
      return;
    }

    if (!this.config.dsn) {
      console.warn('Sentry DSN not configured');
      return;
    }

    try {
      Sentry.init(this.config);
      this.isInitialized = true;
      console.log('Sentry initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Sentry:', error);
    }
  }

  /**
   * Filter sensitive data before sending to Sentry
   */
  private beforeSend(event: any): any {
    // Remove sensitive data
    if (event.request?.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
    }

    // Remove sensitive URL parameters
    if (event.request?.url) {
      const url = new URL(event.request.url);
      url.searchParams.delete('token');
      url.searchParams.delete('password');
      event.request.url = url.toString();
    }

    // Add custom context
    event.extra = {
      ...event.extra,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    };

    return event;
  }

  /**
   * Filter breadcrumbs before sending to Sentry
   */
  private beforeBreadcrumb(breadcrumb: any): any {
    // Remove sensitive data from breadcrumbs
    if (breadcrumb.data?.url) {
      const url = new URL(breadcrumb.data.url);
      url.searchParams.delete('token');
      url.searchParams.delete('password');
      breadcrumb.data.url = url.toString();
    }

    return breadcrumb;
  }

  /**
   * Set user context
   */
  setUser(user: { id?: string; email?: string; username?: string; [key: string]: any }): void {
    if (!this.isInitialized) return;

    Sentry.setUser(user);
  }

  /**
   * Set user context from user ID
   */
  setUserId(userId: string): void {
    if (!this.isInitialized) return;

    Sentry.setUser({ id: userId });
  }

  /**
   * Set extra context
   */
  setExtra(key: string, value: any): void {
    if (!this.isInitialized) return;

    Sentry.setExtra(key, value);
  }

  /**
   * Set tag
   */
  setTag(key: string, value: string): void {
    if (!this.isInitialized) return;

    Sentry.setTag(key, value);
  }

  /**
   * Set context
   */
  setContext(name: string, context: Record<string, any>): void {
    if (!this.isInitialized) return;

    Sentry.setContext(name, context);
  }

  /**
   * Capture exception
   */
  captureException(error: Error, context?: Record<string, any>): void {
    if (!this.isInitialized) return;

    if (context) {
      Sentry.setContext('error_context', context);
    }

    Sentry.captureException(error);
  }

  /**
   * Capture message
   */
  captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
    if (!this.isInitialized) return;

    Sentry.captureMessage(message, level);
  }

  /**
   * Start performance transaction
   */
  startTransaction(name: string, operation: string): any {
    if (!this.isInitialized) {
      // Return a mock transaction if Sentry is not initialized
      return {
        finish: () => {},
        setTag: () => {},
        setData: () => {},
        setStatus: () => {},
      };
    }

    // Use a simpler approach for now
    return {
      finish: () => {
        Sentry.addBreadcrumb({
          category: 'performance',
          message: `Transaction finished: ${name}`,
          data: { operation }
        });
      },
      setTag: (key: string, value: string) => {
        Sentry.setTag(key, value);
      },
      setData: (key: string, value: any) => {
        Sentry.setExtra(key, value);
      },
      setStatus: (status: string) => {
        Sentry.setTag('transaction_status', status);
      },
    };
  }

  /**
   * Add breadcrumb
   */
  addBreadcrumb(breadcrumb: {
    category: string;
    message: string;
    level?: Sentry.SeverityLevel;
    data?: Record<string, any>;
  }): void {
    if (!this.isInitialized) return;

    Sentry.addBreadcrumb(breadcrumb);
  }

  /**
   * Track API call
   */
  trackApiCall(url: string, method: string, statusCode?: number, duration?: number): void {
    if (!this.isInitialized) return;

    const transaction = this.startTransaction(`${method} ${url}`, 'http');
    
    transaction.setTag('http.method', method);
    transaction.setTag('http.url', url);
    
    if (statusCode) {
      transaction.setTag('http.status_code', statusCode);
    }
    
    if (duration) {
      transaction.setData('duration', duration);
    }

    // Add breadcrumb
    this.addBreadcrumb({
      category: 'api',
      message: `${method} ${url}`,
      level: statusCode && statusCode >= 400 ? 'error' : 'info',
      data: {
        url,
        method,
        statusCode,
        duration,
      },
    });

    // Finish transaction after a delay to simulate the API call duration
    setTimeout(() => {
      transaction.finish();
    }, duration || 100);
  }

  /**
   * Track user action
   */
  trackUserAction(action: string, data?: Record<string, any>): void {
    if (!this.isInitialized) return;

    this.addBreadcrumb({
      category: 'user_action',
      message: action,
      data,
    });
  }

  /**
   * Track page view
   */
  trackPageView(path: string): void {
    if (!this.isInitialized) return;

    this.addBreadcrumb({
      category: 'navigation',
      message: `Page view: ${path}`,
      data: {
        path,
        timestamp: new Date().toISOString(),
      },
    });
  }

  /**
   * Track performance metric
   */
  trackPerformanceMetric(name: string, value: number, unit: string = 'ms'): void {
    if (!this.isInitialized) return;

    // Use setExtra instead of metrics for now
    Sentry.setExtra(`metric_${name}`, { value, unit });
  }

  /**
   * Track error with custom context
   */
  trackError(error: Error, context?: {
    component?: string;
    action?: string;
    data?: any;
    user?: any;
  }): void {
    if (!this.isInitialized) return;

    if (context?.component) {
      Sentry.setTag('component', context.component);
    }

    if (context?.action) {
      Sentry.setTag('action', context.action);
    }

    if (context?.data) {
      Sentry.setExtra('error_data', context.data);
    }

    if (context?.user) {
      Sentry.setUser(context.user);
    }

    Sentry.captureException(error);
  }

  /**
   * Get Sentry instance
   */
  getSentry(): typeof Sentry {
    return Sentry;
  }

  /**
   * Check if Sentry is initialized
   */
  isSentryInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Close Sentry
   */
  close(): void {
    if (this.isInitialized) {
      Sentry.close();
      this.isInitialized = false;
    }
  }
}

// Create singleton instance
export const sentryManager = new SentryManager();

// Export for use in components
export default sentryManager; 