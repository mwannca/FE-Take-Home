/**
 * Service Worker Registration and Management
 * 
 * Provides:
 * - Service worker registration
 * - Offline/online status detection
 * - Background sync registration
 * - Push notification support
 * - Cache management
 */

interface ServiceWorkerMessage {
  type: string;
  data?: any;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private isOnline = navigator.onLine;
  private listeners: Map<string, Function[]> = new Map();

  constructor() {
    this.setupEventListeners();
  }

  /**
   * Register service worker
   */
  async register(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker not supported');
      return null;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', this.registration);

      // Handle service worker updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration!.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              this.notifyListeners('updateAvailable', { registration: this.registration });
            }
          });
        }
      });

      // Handle service worker messages
      navigator.serviceWorker.addEventListener('message', (event) => {
        this.handleServiceWorkerMessage(event.data);
      });

      return this.registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  /**
   * Setup event listeners for online/offline status
   */
  private setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners('online', {});
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners('offline', {});
    });
  }

  /**
   * Handle messages from service worker
   */
  private handleServiceWorkerMessage(message: ServiceWorkerMessage) {
    console.log('Service Worker message received:', message);

    switch (message.type) {
      case 'FRUITS_DATA_SYNCED':
        this.notifyListeners('dataSynced', message.data);
        break;
      default:
        console.log('Unknown service worker message type:', message.type);
    }
  }

  /**
   * Add event listener
   */
  addEventListener(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * Remove event listener
   */
  removeEventListener(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Notify listeners of an event
   */
  private notifyListeners(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  /**
   * Check if app is online
   */
  isOnlineStatus(): boolean {
    return this.isOnline;
  }

  /**
   * Register background sync
   */
  async registerBackgroundSync(tag: string): Promise<boolean> {
    if (!this.registration || !('sync' in this.registration)) {
      console.warn('Background Sync not supported');
      return false;
    }

    try {
      const reg = this.registration as ServiceWorkerRegistration;
      // Define ServiceWorkerSyncManager type if not available
      type ServiceWorkerSyncManager = {
        register: (tag: string) => Promise<void>;
      };
      if (reg && 'sync' in reg && typeof (reg as any).sync?.register === 'function') {
        const syncManager = (reg as any).sync as ServiceWorkerSyncManager;
        await syncManager.register(tag);
        console.log('Background sync registered:', tag);
        return true;
      } else {
        console.warn('Background sync not supported.');
        return false;
      }
    } catch (error) {
      console.error('Background sync registration failed:', error);
      return false;
    }
  }

  /**
   * Request push notification permission
   */
  async requestNotificationPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Push notifications not supported');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission === 'denied') {
      console.warn('Notification permission denied');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch (error) {
      console.error('Notification permission request failed:', error);
      return false;
    }
  }

  /**
   * Send message to service worker
   */
  async sendMessage(message: ServiceWorkerMessage): Promise<void> {
    if (!this.registration || !this.registration.active) {
      console.warn('Service worker not active');
      return;
    }

    try {
      await this.registration.active.postMessage(message);
    } catch (error) {
      console.error('Failed to send message to service worker:', error);
    }
  }

  /**
   * Cache fruits data
   */
  async cacheFruitsData(fruits: any[]): Promise<void> {
    await this.sendMessage({
      type: 'CACHE_FRUITS',
      data: { fruits }
    });
  }

  /**
   * Update service worker
   */
  async updateServiceWorker(): Promise<void> {
    if (!this.registration) {
      console.warn('No service worker registration');
      return;
    }

    try {
      await this.registration.update();
      console.log('Service worker update requested');
    } catch (error) {
      console.error('Service worker update failed:', error);
    }
  }

  /**
   * Skip waiting and activate new service worker
   */
  async skipWaiting(): Promise<void> {
    if (!this.registration || !this.registration.waiting) {
      console.warn('No waiting service worker');
      return;
    }

    try {
      await this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      console.log('Skip waiting message sent');
    } catch (error) {
      console.error('Skip waiting failed:', error);
    }
  }

  /**
   * Get cache status
   */
  async getCacheStatus(): Promise<{ static: boolean; dynamic: boolean }> {
    const staticCache = await caches.open('fruits-app-static-v1');
    const dynamicCache = await caches.open('fruits-app-dynamic-v1');

    const staticKeys = await staticCache.keys();
    const dynamicKeys = await dynamicCache.keys();

    return {
      static: staticKeys.length > 0,
      dynamic: dynamicKeys.length > 0
    };
  }

  /**
   * Clear all caches
   */
  async clearCaches(): Promise<void> {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('All caches cleared');
    } catch (error) {
      console.error('Failed to clear caches:', error);
    }
  }
}

// Create singleton instance
export const serviceWorkerManager = new ServiceWorkerManager();

// Export for use in components
export default serviceWorkerManager; 