/**
 * Real User Monitoring (RUM)
 * 
 * Tracks:
 * - Core Web Vitals
 * - User interactions
 * - Performance metrics
 * - Error rates
 * - User experience metrics
 */

interface RUMEvent {
  type: string;
  timestamp: number;
  data: any;
  sessionId: string;
  userId?: string;
}

interface WebVitals {
  CLS: number;
  FID: number;
  FCP: number;
  LCP: number;
  TTFB: number;
}

interface UserInteraction {
  type: 'click' | 'scroll' | 'input' | 'navigation';
  element: string;
  path: string;
  timestamp: number;
  duration?: number;
}

class RUMMonitor {
  private events: RUMEvent[] = [];
  private sessionId: string;
  private userId?: string;
  private isEnabled: boolean;
  private batchSize: number = 10;
  private flushInterval: number = 30000; // 30 seconds
  private endpoint: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isEnabled = process.env.NODE_ENV === 'production';
    this.endpoint = process.env.REACT_APP_RUM_ENDPOINT || '/api/rum';
    this.initialize();
  }

  /**
   * Initialize RUM monitoring
   */
  private initialize() {
    if (!this.isEnabled) {
      console.log('RUM monitoring disabled in development');
      return;
    }

    this.setupWebVitals();
    this.setupUserInteractions();
    this.setupPerformanceMonitoring();
    this.setupErrorTracking();
    this.setupBatchFlushing();

    console.log('RUM monitoring initialized');
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Setup Core Web Vitals monitoring
   */
  private setupWebVitals() {
    if ('web-vitals' in window) {
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(this.handleWebVital.bind(this, 'CLS'));
        getFID(this.handleWebVital.bind(this, 'FID'));
        getFCP(this.handleWebVital.bind(this, 'FCP'));
        getLCP(this.handleWebVital.bind(this, 'LCP'));
        getTTFB(this.handleWebVital.bind(this, 'TTFB'));
      });
    }
  }

  /**
   * Handle web vital metric
   */
  private handleWebVital(name: string, metric: any) {
    this.trackEvent('web_vital', {
      name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
      entries: metric.entries?.length || 0
    });
  }

  /**
   * Setup user interaction tracking
   */
  private setupUserInteractions() {
    // Track clicks
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      this.trackUserInteraction('click', target.tagName.toLowerCase(), target.className);
    });

    // Track scroll events (throttled)
    let scrollTimeout: NodeJS.Timeout;
    document.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.trackUserInteraction('scroll', 'document', '');
      }, 100);
    });

    // Track input events
    document.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement;
      this.trackUserInteraction('input', target.tagName.toLowerCase(), target.type);
    });

    // Track navigation
    window.addEventListener('popstate', () => {
      this.trackUserInteraction('navigation', 'window', window.location.pathname);
    });
  }

  /**
   * Track user interaction
   */
  private trackUserInteraction(type: string, element: string, details: string) {
    this.trackEvent('user_interaction', {
      type,
      element,
      details,
      path: window.location.pathname,
      timestamp: performance.now()
    });
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring() {
    // Track page load performance
    window.addEventListener('load', () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.trackEvent('page_load', {
          domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
          loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
          domInteractive: navigation.domInteractive,
          domComplete: navigation.domComplete,
          loadEventEnd: navigation.loadEventEnd,
          firstPaint: performance.getEntriesByName('first-paint')[0]?.startTime,
          firstContentfulPaint: performance.getEntriesByName('first-contentful-paint')[0]?.startTime
        });
      }
    });

    // Track resource loading
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;
          this.trackEvent('resource_load', {
            name: resourceEntry.name,
            duration: resourceEntry.duration,
            size: resourceEntry.transferSize,
            type: resourceEntry.initiatorType
          });
        }
      });
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  /**
   * Setup error tracking
   */
  private setupErrorTracking() {
    // Track JavaScript errors
    window.addEventListener('error', (event) => {
      this.trackEvent('error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error?.stack
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackEvent('unhandled_rejection', {
        reason: event.reason,
        promise: event.promise
      });
    });
  }

  /**
   * Setup batch flushing
   */
  private setupBatchFlushing() {
    setInterval(() => {
      this.flushEvents();
    }, this.flushInterval);
  }

  /**
   * Track custom event
   */
  trackEvent(type: string, data: any) {
    if (!this.isEnabled) return;

    const event: RUMEvent = {
      type,
      timestamp: Date.now(),
      data,
      sessionId: this.sessionId,
      userId: this.userId
    };

    this.events.push(event);

    // Flush if batch is full
    if (this.events.length >= this.batchSize) {
      this.flushEvents();
    }
  }

  /**
   * Track custom metric
   */
  trackMetric(name: string, value: number, tags?: Record<string, string>) {
    this.trackEvent('metric', {
      name,
      value,
      tags
    });
  }

  /**
   * Track user journey
   */
  trackUserJourney(step: string, data?: any) {
    this.trackEvent('user_journey', {
      step,
      path: window.location.pathname,
      timestamp: performance.now(),
      ...data
    });
  }

  /**
   * Track performance mark
   */
  trackPerformanceMark(name: string, startMark?: string) {
    if (startMark) {
      performance.measure(name, startMark);
    } else {
      performance.mark(name);
    }

    this.trackEvent('performance_mark', {
      name,
      startMark,
      timestamp: performance.now()
    });
  }

  /**
   * Set user ID for tracking
   */
  setUserId(userId: string) {
    this.userId = userId;
  }

  /**
   * Flush events to server
   */
  private async flushEvents() {
    if (this.events.length === 0) return;

    const eventsToSend = [...this.events];
    this.events = [];

    try {
      await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          events: eventsToSend,
          sessionId: this.sessionId,
          userId: this.userId,
          userAgent: navigator.userAgent,
          timestamp: Date.now()
        })
      });
    } catch (error) {
      console.error('Failed to send RUM events:', error);
      // Re-add events to queue for retry
      this.events.unshift(...eventsToSend);
    }
  }

  /**
   * Get current session ID
   */
  getSessionId(): string {
    return this.sessionId;
  }

  /**
   * Get current events count
   */
  getEventsCount(): number {
    return this.events.length;
  }

  /**
   * Force flush events
   */
  async forceFlush(): Promise<void> {
    await this.flushEvents();
  }
}

// Create singleton instance
export const rumMonitor = new RUMMonitor();

// Export for use in components
export default rumMonitor; 