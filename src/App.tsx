import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Layout } from './components/layout/Layout';
import { HomePage, FruitsPage } from './pages';
import { ErrorBoundary, PerformanceMonitor, MonitoringDashboard } from './components/common';
import { queryClient } from './services/queryClient';
import serviceWorkerManager from './utils/serviceWorker';
import workerManager from './utils/workerManager';
import rumMonitor from './utils/rum';
import sentryManager from './utils/sentry';
import './index.css';

function App() {
  useEffect(() => {
    // Initialize all monitoring systems
    initializeMonitoring();
  }, []);

  const initializeMonitoring = async () => {
    try {
      // Initialize Sentry
      sentryManager.initialize();
      sentryManager.setTag('app', 'fruits-explorer');
      sentryManager.setTag('environment', process.env.NODE_ENV || 'development');

      // Initialize Service Worker
      await serviceWorkerManager.register();
      
      // Set up service worker event listeners
      serviceWorkerManager.addEventListener('online', () => {
        console.log('App is online');
        sentryManager.addBreadcrumb({
          category: 'connectivity',
          message: 'App went online'
        });
      });

      serviceWorkerManager.addEventListener('offline', () => {
        console.log('App is offline');
        sentryManager.addBreadcrumb({
          category: 'connectivity',
          message: 'App went offline'
        });
      });

      serviceWorkerManager.addEventListener('dataSynced', (data: any) => {
        console.log('Data synced from service worker:', data);
        sentryManager.trackUserAction('data_synced', { data });
      });

      // Initialize RUM monitoring
      rumMonitor.setUserId('anonymous');
      rumMonitor.trackUserJourney('app_initialized');

      // Check Web Worker support
      if (workerManager.isWorkerSupported()) {
        console.log('Web Workers are supported');
        sentryManager.setTag('web_worker_support', 'true');
      } else {
        console.warn('Web Workers not supported');
        sentryManager.setTag('web_worker_support', 'false');
      }

      // Track app initialization
      sentryManager.trackUserAction('app_initialized', {
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        online: navigator.onLine
      });

      console.log('All monitoring systems initialized');
    } catch (error) {
      console.error('Failed to initialize monitoring:', error);
      sentryManager.captureException(error as Error, {
        component: 'App',
        action: 'initialize_monitoring'
      });
    }
  };

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/fruits" element={<FruitsPage />} />
            </Routes>
          </Layout>
        </Router>
        {process.env.NODE_ENV === 'development' && <ReactQueryDevtools initialIsOpen={false} />}
        {process.env.NODE_ENV === 'development' && <PerformanceMonitor />}
        {process.env.NODE_ENV === 'development' && <MonitoringDashboard />}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
