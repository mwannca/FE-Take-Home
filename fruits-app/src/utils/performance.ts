import React from 'react';

/**
 * Performance monitoring utilities
 * 
 * This module provides utilities for monitoring and optimizing performance:
 * - Bundle size analysis
 * - Component render timing
 * - Memory usage tracking
 * - Performance metrics collection
 */

// Performance metrics storage
interface PerformanceMetrics {
  componentRenderTimes: Map<string, number[]>;
  bundleSize: number | null;
  memoryUsage: number | null;
  lastUpdate: number;
}

const metrics: PerformanceMetrics = {
  componentRenderTimes: new Map(),
  bundleSize: null,
  memoryUsage: null,
  lastUpdate: Date.now(),
};

/**
 * Higher-order component for measuring render performance
 */
export const withPerformanceTracking = <P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
) => {
  return React.memo((props: P) => {
    const startTime = performance.now();
    
    React.useEffect(() => {
      const renderTime = performance.now() - startTime;
      
      if (!metrics.componentRenderTimes.has(componentName)) {
        metrics.componentRenderTimes.set(componentName, []);
      }
      
      const times = metrics.componentRenderTimes.get(componentName)!;
      times.push(renderTime);
      
      // Keep only last 100 measurements
      if (times.length > 100) {
        times.shift();
      }
      
      // Log slow renders in development
      if (process.env.NODE_ENV === 'development' && renderTime > 16) {
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
    });
    
    return React.createElement(Component, props);
  });
};

/**
 * Get performance metrics
 */
export const getPerformanceMetrics = () => {
  const avgRenderTimes: Record<string, number> = {};
  
  metrics.componentRenderTimes.forEach((times, componentName) => {
    if (times.length > 0) {
      const avg = times.reduce((sum, time) => sum + time, 0) / times.length;
      avgRenderTimes[componentName] = avg;
    }
  });
  
  return {
    avgRenderTimes,
    bundleSize: metrics.bundleSize,
    memoryUsage: metrics.memoryUsage,
    lastUpdate: metrics.lastUpdate,
  };
};

/**
 * Measure bundle size (approximate)
 */
export const measureBundleSize = async () => {
  try {
    const response = await fetch('/static/js/bundle.js');
    const blob = await response.blob();
    metrics.bundleSize = blob.size;
    metrics.lastUpdate = Date.now();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Bundle size: ${(blob.size / 1024).toFixed(2)}KB`);
    }
  } catch (error) {
    console.warn('Could not measure bundle size:', error);
  }
};

/**
 * Measure memory usage (if available)
 */
export const measureMemoryUsage = () => {
  if ('memory' in performance) {
    const memory = (performance as any).memory;
    metrics.memoryUsage = memory.usedJSHeapSize;
    metrics.lastUpdate = Date.now();
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Memory usage: ${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`);
    }
  }
};

/**
 * Performance optimization utilities
 */
export const performanceUtils = {
  // Debounce function calls
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },
  
  // Throttle function calls
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },
  
  // Memoize expensive computations
  memoize: <T extends (...args: any[]) => any>(
    func: T,
    keyGenerator?: (...args: Parameters<T>) => string
  ): T => {
    const cache = new Map<string, ReturnType<T>>();
    
    return ((...args: Parameters<T>) => {
      const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args);
      
      if (cache.has(key)) {
        return cache.get(key);
      }
      
      const result = func(...args);
      cache.set(key, result);
      return result;
    }) as T;
  },

  // Get bundle size
  getBundleSize: (): number => {
    return metrics.bundleSize || 0;
  },

  // Get memory usage
  getMemoryUsage: (): number => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
    }
    return 0;
  },

  // Get average render time
  getAverageRenderTime: (): number => {
    let totalTime = 0;
    let totalCount = 0;
    
    metrics.componentRenderTimes.forEach((times) => {
      if (times.length > 0) {
        totalTime += times.reduce((sum, time) => sum + time, 0);
        totalCount += times.length;
      }
    });
    
    return totalCount > 0 ? totalTime / totalCount : 0;
  },

  // Get average API response time
  getAverageApiResponseTime: (): number => {
    // This would be implemented with actual API timing data
    return 150; // Mock value
  },

  // Get component render count
  getComponentRenderCount: (): number => {
    let totalCount = 0;
    metrics.componentRenderTimes.forEach((times) => {
      totalCount += times.length;
    });
    return totalCount;
  },

  // Clear metrics
  clearMetrics: (): void => {
    metrics.componentRenderTimes.clear();
    metrics.bundleSize = null;
    metrics.memoryUsage = null;
    metrics.lastUpdate = Date.now();
  },

  // Export metrics
  exportMetrics: (): void => {
    const data = getPerformanceMetrics();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-metrics-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },
};

// Initialize performance monitoring
if (process.env.NODE_ENV === 'development') {
  // Measure bundle size on load
  window.addEventListener('load', () => {
    setTimeout(measureBundleSize, 1000);
    setInterval(measureMemoryUsage, 30000); // Every 30 seconds
  });
  
  // Expose metrics to window for debugging
  (window as any).__PERFORMANCE_METRICS__ = getPerformanceMetrics;
} 