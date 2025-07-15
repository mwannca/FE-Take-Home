import React, { useState, useEffect } from 'react';
import serviceWorkerManager from '@/utils/serviceWorker';
import workerManager from '@/utils/workerManager';
import rumMonitor from '@/utils/rum';
import sentryManager from '@/utils/sentry';

interface MonitoringStatus {
  serviceWorker: boolean;
  webWorker: boolean;
  rum: boolean;
  sentry: boolean;
  online: boolean;
  cacheStatus: {
    static: boolean;
    dynamic: boolean;
  };
}

interface PerformanceMetrics {
  bundleSize: number | null;
  memoryUsage: number | null;
  sessionId: string;
  eventsCount: number;
}

const MonitoringDashboard: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [status, setStatus] = useState<MonitoringStatus>({
    serviceWorker: false,
    webWorker: false,
    rum: false,
    sentry: false,
    online: true,
    cacheStatus: { static: false, dynamic: false }
  });
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    bundleSize: null,
    memoryUsage: null,
    sessionId: '',
    eventsCount: 0
  });

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const updateStatus = async () => {
      const cacheStatus = await serviceWorkerManager.getCacheStatus();
      
      setStatus(prev => ({
        ...prev,
        serviceWorker: true, // Assuming it's registered
        webWorker: workerManager.isWorkerSupported(),
        rum: true, // Assuming it's initialized
        sentry: sentryManager.isSentryInitialized(),
        online: serviceWorkerManager.isOnlineStatus(),
        cacheStatus
      }));

      setMetrics(prev => ({
        ...prev,
        sessionId: rumMonitor.getSessionId(),
        eventsCount: rumMonitor.getEventsCount()
      }));
    };

    updateStatus();
    const interval = setInterval(updateStatus, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    // Measure bundle size and memory
    const measureMetrics = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize
        }));
      }
    };

    measureMetrics();
    const interval = setInterval(measureMetrics, 10000);

    return () => clearInterval(interval);
  }, []);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const formatBytes = (bytes: number | null) => {
    if (bytes === null) return 'N/A';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'text-green-600' : 'text-red-600';
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? '✅' : '❌';
  };

  return (
    <>
      {/* Toggle button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="fixed bottom-4 left-4 z-50 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full shadow-lg transition-colors"
        title="Monitoring Dashboard"
      >
        📊
      </button>

      {/* Dashboard panel */}
      {isVisible && (
        <div className="fixed bottom-16 left-4 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-96 max-h-96 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Monitoring Dashboard</h3>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <div className="space-y-4 text-sm">
            {/* System Status */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">System Status</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Service Worker</span>
                  <span className={getStatusColor(status.serviceWorker)}>
                    {getStatusIcon(status.serviceWorker)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Web Worker</span>
                  <span className={getStatusColor(status.webWorker)}>
                    {getStatusIcon(status.webWorker)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>RUM Monitor</span>
                  <span className={getStatusColor(status.rum)}>
                    {getStatusIcon(status.rum)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Sentry</span>
                  <span className={getStatusColor(status.sentry)}>
                    {getStatusIcon(status.sentry)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Online Status</span>
                  <span className={getStatusColor(status.online)}>
                    {getStatusIcon(status.online)}
                  </span>
                </div>
              </div>
            </div>

            {/* Cache Status */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Cache Status</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Static Cache</span>
                  <span className={getStatusColor(status.cacheStatus.static)}>
                    {getStatusIcon(status.cacheStatus.static)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Dynamic Cache</span>
                  <span className={getStatusColor(status.cacheStatus.dynamic)}>
                    {getStatusIcon(status.cacheStatus.dynamic)}
                  </span>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Performance Metrics</h4>
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span>Memory Usage</span>
                  <span className="text-gray-900 font-mono">
                    {formatBytes(metrics.memoryUsage)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Session ID</span>
                  <span className="text-gray-900 font-mono text-xs">
                    {metrics.sessionId.slice(0, 8)}...
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>RUM Events</span>
                  <span className="text-gray-900 font-mono">
                    {metrics.eventsCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => serviceWorkerManager.clearCaches()}
                  className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs"
                >
                  Clear Cache
                </button>
                <button
                  onClick={() => rumMonitor.forceFlush()}
                  className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs"
                >
                  Flush RUM
                </button>
                <button
                  onClick={() => serviceWorkerManager.updateServiceWorker()}
                  className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-xs"
                >
                  Update SW
                </button>
                <button
                  onClick={() => {
                    console.log('Performance metrics:', (window as any).__PERFORMANCE_METRICS__?.());
                  }}
                  className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded text-xs"
                >
                  Log Metrics
                </button>
              </div>
            </div>

            <div className="text-xs text-gray-500">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MonitoringDashboard; 