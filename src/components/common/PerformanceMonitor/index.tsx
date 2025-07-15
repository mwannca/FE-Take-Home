import React, { useState, useEffect, memo } from 'react';
import { performanceUtils } from '@/utils/performance';

interface PerformanceMetrics {
  bundleSize: number;
  memoryUsage: number;
  renderTime: number;
  apiResponseTime: number;
  componentRenderCount: number;
}

interface PerformanceMonitorProps {
  isVisible?: boolean;
  onToggle?: () => void;
}

export const PerformanceMonitor = memo(({ isVisible = false, onToggle }: PerformanceMonitorProps) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    bundleSize: 0,
    memoryUsage: 0,
    renderTime: 0,
    apiResponseTime: 0,
    componentRenderCount: 0,
  });
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!isVisible) return;

    const updateMetrics = () => {
      const newMetrics = {
        bundleSize: performanceUtils.getBundleSize(),
        memoryUsage: performanceUtils.getMemoryUsage(),
        renderTime: performanceUtils.getAverageRenderTime(),
        apiResponseTime: performanceUtils.getAverageApiResponseTime(),
        componentRenderCount: performanceUtils.getComponentRenderCount(),
      };
      setMetrics(newMetrics);
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 2000);

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  const getPerformanceColor = (value: number, threshold: number) => {
    if (value <= threshold * 0.7) return 'text-green-600';
    if (value <= threshold) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms.toFixed(1)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-all duration-200"
        title="Performance Monitor"
      >
        📊
      </button>

      {/* Expanded Panel */}
      {isExpanded && (
        <div className="absolute bottom-16 right-0 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Performance Monitor</h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3">
            {/* Bundle Size */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Bundle Size:</span>
              <span className={`text-sm font-medium ${getPerformanceColor(metrics.bundleSize, 500000)}`}>
                {formatBytes(metrics.bundleSize)}
              </span>
            </div>

            {/* Memory Usage */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Memory Usage:</span>
              <span className={`text-sm font-medium ${getPerformanceColor(metrics.memoryUsage, 50)}`}>
                {formatBytes(metrics.memoryUsage * 1024 * 1024)}
              </span>
            </div>

            {/* Render Time */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Avg Render Time:</span>
              <span className={`text-sm font-medium ${getPerformanceColor(metrics.renderTime, 16)}`}>
                {formatTime(metrics.renderTime)}
              </span>
            </div>

            {/* API Response Time */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">API Response:</span>
              <span className={`text-sm font-medium ${getPerformanceColor(metrics.apiResponseTime, 200)}`}>
                {formatTime(metrics.apiResponseTime)}
              </span>
            </div>

            {/* Component Render Count */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Component Renders:</span>
              <span className="text-sm font-medium text-gray-900">
                {metrics.componentRenderCount}
              </span>
            </div>

            {/* Performance Actions */}
            <div className="pt-3 border-t border-gray-200">
              <div className="flex space-x-2">
                <button
                  onClick={() => performanceUtils.clearMetrics()}
                  className="flex-1 px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded transition-colors"
                >
                  Clear Metrics
                </button>
                <button
                  onClick={() => performanceUtils.exportMetrics()}
                  className="flex-1 px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded transition-colors"
                >
                  Export
                </button>
              </div>
            </div>

            {/* Performance Tips */}
            <div className="pt-3 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-900 mb-2">Performance Tips:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                {metrics.bundleSize > 500000 && (
                  <li>• Consider code splitting to reduce bundle size</li>
                )}
                {metrics.memoryUsage > 50 && (
                  <li>• Check for memory leaks in components</li>
                )}
                {metrics.renderTime > 16 && (
                  <li>• Optimize component rendering with React.memo</li>
                )}
                {metrics.apiResponseTime > 200 && (
                  <li>• Consider caching API responses</li>
                )}
                {metrics.componentRenderCount > 1000 && (
                  <li>• Reduce unnecessary re-renders</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

PerformanceMonitor.displayName = 'PerformanceMonitor';

export default PerformanceMonitor; 