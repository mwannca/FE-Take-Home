import { getFruits } from './api';

// Mock fetch globally
global.fetch = jest.fn();

describe('api', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getFruits', () => {
    it('fetches fruits successfully', async () => {
      const mockFruits = [
        {
          id: 1,
          name: 'Apple',
          family: 'Rosaceae',
          order: 'Rosales',
          genus: 'Malus',
          calories: 52
        }
      ];

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockFruits
      });

      const result = await getFruits();

      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/fruits'));
      expect(result).toEqual(mockFruits);
    });

    it('throws error when response is not ok', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      });

      await expect(getFruits()).rejects.toThrow('Failed to fetch fruits');
    });

    it('throws error when network request fails', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(getFruits()).rejects.toThrow('Network error');
    });

    it('uses correct API URL', async () => {
      const mockFruits: any[] = [];
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockFruits
      });

      await getFruits();

      expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/fruits'));
    });

    it('handles empty response', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      const result = await getFruits();
      expect(result).toEqual([]);
    });

    it('handles large response', async () => {
      const largeFruitsArray = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `Fruit ${i + 1}`,
        family: 'Test Family',
        order: 'Test Order',
        genus: 'Test Genus',
        calories: 50 + i
      }));

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => largeFruitsArray
      });

      const result = await getFruits();
      expect(result).toHaveLength(100);
    });
  });
}); 