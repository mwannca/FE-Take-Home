import { serviceWorkerManager } from './serviceWorker';

// Mock ServiceWorker APIs for Jest (Node.js does not support them)
Object.defineProperty(global, 'navigator', {
  value: {
    serviceWorker: {
      register: jest.fn().mockResolvedValue({
        sync: {
          register: jest.fn().mockResolvedValue(undefined),
        },
        addEventListener: jest.fn(),
      }),
      addEventListener: jest.fn(),
      controller: {},
    },
  },
  writable: true,
});

// Mock the service worker registration
const mockRegister = jest.fn();
const mockAddEventListener = jest.fn();
const mockRemoveEventListener = jest.fn();

Object.defineProperty(navigator, 'serviceWorker', {
  value: {
    register: mockRegister,
    addEventListener: mockAddEventListener,
    removeEventListener: mockRemoveEventListener,
  },
  writable: true,
});

// Mock fetch
global.fetch = jest.fn();

describe('Service Worker Manager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  describe('register', () => {
    it('registers service worker successfully', async () => {
      const mockRegistration = {
        active: { postMessage: jest.fn() },
        installing: null,
        waiting: null,
        updateViaCache: 'all',
      };
      mockRegister.mockResolvedValue(mockRegistration);

      const result = await serviceWorkerManager.register();

      expect(mockRegister).toHaveBeenCalledWith('/sw.js', {
        scope: '/',
        updateViaCache: 'all',
      });
      expect(result).toBe(mockRegistration);
    });

    it('handles registration errors gracefully', async () => {
      const error = new Error('Service worker registration failed');
      mockRegister.mockRejectedValue(error);

      await expect(serviceWorkerManager.register()).rejects.toThrow('Service worker registration failed');
    });

    it('returns null when service workers are not supported', async () => {
      Object.defineProperty(navigator, 'serviceWorker', {
        value: undefined,
        writable: true,
      });

      const result = await serviceWorkerManager.register();
      expect(result).toBeNull();
    });
  });

  describe('cacheFruitsData', () => {
    it('caches fruits data successfully', async () => {
      const mockFruits = [
        { id: 1, name: 'Apple', calories: 52 },
        { id: 2, name: 'Banana', calories: 89 },
      ];

      const mockResponse = new Response(JSON.stringify(mockFruits));
      (global.fetch as jest.Mock).mockResolvedValue(mockResponse);

      await serviceWorkerManager.cacheFruitsData(mockFruits);

      expect(global.fetch).toHaveBeenCalledWith('/api/fruits');
    });

    it('handles caching errors gracefully', async () => {
      const mockFruits = [{ id: 1, name: 'Apple', calories: 52 }];
      (global.fetch as jest.Mock).mockRejectedValue(new Error('Cache failed'));

      await expect(serviceWorkerManager.cacheFruitsData(mockFruits)).rejects.toThrow('Cache failed');
    });
  });

  describe('registerBackgroundSync', () => {
    it('registers background sync successfully', async () => {
      const result = await serviceWorkerManager.registerBackgroundSync('test-sync');

      expect(result).toBe(true);
    });

    it('handles background sync registration errors', async () => {
      // Mock the registration to be null
      jest.spyOn(serviceWorkerManager as any, 'registration', 'get').mockReturnValue(null);

      const result = await serviceWorkerManager.registerBackgroundSync('test-sync');

      expect(result).toBe(false);
    });
  });

  describe('sendMessage', () => {
    it('sends message to service worker successfully', async () => {
      await serviceWorkerManager.sendMessage({ type: 'TEST_MESSAGE', data: 'test' });

      // Verify the method was called
      expect(serviceWorkerManager.sendMessage).toHaveBeenCalledWith({
        type: 'TEST_MESSAGE',
        data: 'test',
      });
    });

    it('handles message sending errors', async () => {
      // Mock the registration to be null
      jest.spyOn(serviceWorkerManager as any, 'registration', 'get').mockReturnValue(null);

      await serviceWorkerManager.sendMessage({ type: 'TEST_MESSAGE' });

      // Should not throw, just log warning
      expect(serviceWorkerManager.sendMessage).toHaveBeenCalledWith({
        type: 'TEST_MESSAGE',
      });
    });
  });

  describe('isOnlineStatus', () => {
    it('returns online status correctly', () => {
      const result = serviceWorkerManager.isOnlineStatus();
      expect(typeof result).toBe('boolean');
    });
  });
}); 