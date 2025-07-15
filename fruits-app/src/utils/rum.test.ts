import { rumMonitor } from './rum';

// Mock performance API
const mockPerformance = {
  mark: jest.fn(),
  measure: jest.fn(),
  getEntriesByType: jest.fn(),
  getEntriesByName: jest.fn(),
  now: jest.fn(),
};

Object.defineProperty(window, 'performance', {
  value: mockPerformance,
  writable: true,
});

// Mock global.fetch for analytics endpoint calls
beforeAll(() => {
  global.fetch = jest.fn(() => Promise.resolve({ ok: true, json: () => Promise.resolve({}) })) as any;
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('RUM Monitor', () => {
  beforeEach(() => {
    (global.fetch as jest.Mock).mockClear();
  });

  describe('trackMetric', () => {
    it('tracks custom metrics correctly', () => {
      rumMonitor.trackMetric('test_metric', 100);
      
      // Verify metric was tracked
      expect(rumMonitor.getEventsCount()).toBeGreaterThan(0);
    });

    it('handles multiple metrics', () => {
      rumMonitor.trackMetric('metric1', 50);
      rumMonitor.trackMetric('metric2', 75);
      
      expect(rumMonitor.getEventsCount()).toBeGreaterThanOrEqual(2);
    });
  });

  describe('trackUserJourney', () => {
    it('tracks user journey events', () => {
      rumMonitor.trackUserJourney('test_event', { userId: '123' });
      
      expect(rumMonitor.getEventsCount()).toBeGreaterThan(0);
    });

    it('handles journey events with metadata', () => {
      const metadata = { page: '/fruits', action: 'add_fruit' };
      rumMonitor.trackUserJourney('fruit_added', metadata);
      
      expect(rumMonitor.getEventsCount()).toBeGreaterThan(0);
    });
  });

  describe('trackPerformanceMark', () => {
    it('creates performance marks', () => {
      rumMonitor.trackPerformanceMark('test_mark');
      
      expect(mockPerformance.mark).toHaveBeenCalledWith('test_mark');
    });

    it('creates performance measures', () => {
      rumMonitor.trackPerformanceMark('start');
      rumMonitor.trackPerformanceMark('end');
      
      expect(mockPerformance.mark).toHaveBeenCalledWith('start');
      expect(mockPerformance.mark).toHaveBeenCalledWith('end');
    });
  });

  describe('trackEvent', () => {
    it('tracks events correctly', () => {
      rumMonitor.trackEvent('test_event', { data: 'test' });
      
      expect(rumMonitor.getEventsCount()).toBeGreaterThan(0);
    });
  });

  describe('getSessionId', () => {
    it('returns session ID', () => {
      const sessionId = rumMonitor.getSessionId();
      
      expect(typeof sessionId).toBe('string');
      expect(sessionId).toContain('session_');
    });
  });

  describe('forceFlush', () => {
    it('sends data to analytics endpoint', async () => {
      const mockResponse = new Response(JSON.stringify({ success: true }));
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      // Add some test data
      rumMonitor.trackMetric('test_metric', 100);
      rumMonitor.trackUserJourney('test_event', {});

      await rumMonitor.forceFlush();

      expect(global.fetch).toHaveBeenCalled();
    });

    it('handles flush errors gracefully', async () => {
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));

      // Add some test data
      rumMonitor.trackMetric('test_metric', 100);

      await rumMonitor.forceFlush();

      // Should not throw, just log error
      expect(global.fetch).toHaveBeenCalled();
    });
  });

  describe('getEventsCount', () => {
    it('returns correct event count', () => {
      const initialCount = rumMonitor.getEventsCount();
      
      rumMonitor.trackMetric('test_metric', 100);
      
      expect(rumMonitor.getEventsCount()).toBe(initialCount + 1);
    });
  });
}); 