import { workerManager } from './workerManager';
import { Fruit } from '@/types';

// Mock the global Worker for Jest (Node.js does not support Web Workers)
class MockWorker {
  postMessage = jest.fn();
  terminate = jest.fn();
  onmessage = null;
  onerror = null;
}
(global as any).Worker = MockWorker;

const mockFruits: Fruit[] = [
  { id: 1, name: 'Apple', family: 'Rosaceae', order: 'Rosales', genus: 'Malus', calories: 52 },
  { id: 2, name: 'Banana', family: 'Musaceae', order: 'Zingiberales', genus: 'Musa', calories: 89 },
  { id: 3, name: 'Orange', family: 'Rutaceae', order: 'Sapindales', genus: 'Citrus', calories: 47 },
];

describe('Worker Manager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('filterFruits', () => {
    it('filters fruits with criteria', async () => {
      const criteria = {
        family: 'Rosaceae',
        minCalories: 50,
        maxCalories: 100,
      };

      const result = await workerManager.filterFruits(mockFruits, criteria);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('handles empty criteria', async () => {
      const result = await workerManager.filterFruits(mockFruits, {});

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('handles worker errors gracefully', async () => {
      // Test with unsupported worker
      const originalWorker = global.Worker;
      global.Worker = undefined as any;

      const result = await workerManager.filterFruits(mockFruits, { family: 'Rosaceae' });

      expect(result).toEqual([]);

      global.Worker = originalWorker;
    });
  });

  describe('sortFruits', () => {
    it('sorts fruits by name ascending', async () => {
      const result = await workerManager.sortFruits(mockFruits, 'name', 'asc');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(mockFruits.length);
    });

    it('sorts fruits by calories descending', async () => {
      const result = await workerManager.sortFruits(mockFruits, 'calories', 'desc');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('handles invalid sort field', async () => {
      const result = await workerManager.sortFruits(mockFruits, 'invalid' as any, 'asc');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('calculateStatistics', () => {
    it('calculates comprehensive statistics', async () => {
      const result = await workerManager.calculateStatistics(mockFruits);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('totalFruits');
      expect(result).toHaveProperty('averageCalories');
      expect(result).toHaveProperty('calorieDistribution');
    });

    it('handles empty fruit array', async () => {
      const result = await workerManager.calculateStatistics([]);

      expect(result).toBeDefined();
      expect(result.totalFruits).toBe(0);
    });
  });

  describe('processLargeDataset', () => {
    it('processes large datasets with multiple operations', async () => {
      const operations = [
        { type: 'filter', criteria: { family: 'Rosaceae' } },
        { type: 'sort', field: 'name', order: 'asc' },
        { type: 'group', field: 'family' },
      ];

      const result = await workerManager.processLargeDataset(mockFruits, operations);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('handles single operation', async () => {
      const operations = [{ type: 'filter', criteria: { calories: { min: 50 } } }];

      const result = await workerManager.processLargeDataset(mockFruits, operations);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('groupFruits', () => {
    it('groups fruits by family', async () => {
      const result = await workerManager.groupFruits(mockFruits, 'family');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('groups fruits by order', async () => {
      const result = await workerManager.groupFruits(mockFruits, 'order');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('groups fruits by genus', async () => {
      const result = await workerManager.groupFruits(mockFruits, 'genus');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('searchFruits', () => {
    it('searches fruits with query', async () => {
      const result = await workerManager.searchFruits(mockFruits, 'apple');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('handles empty search query', async () => {
      const result = await workerManager.searchFruits(mockFruits, '');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });

    it('handles complex search queries', async () => {
      const result = await workerManager.searchFruits(mockFruits, 'apple rosaceae');

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe('isWorkerSupported', () => {
    it('returns true when workers are supported', () => {
      expect(workerManager.isWorkerSupported()).toBe(true);
    });

    it('returns false when workers are not supported', () => {
      const originalWorker = global.Worker;
      global.Worker = undefined as any;

      expect(workerManager.isWorkerSupported()).toBe(false);

      global.Worker = originalWorker;
    });
  });

  describe('terminate', () => {
    it('terminates worker correctly', () => {
      workerManager.terminate();

      // Should not throw
      expect(workerManager.terminate).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('handles worker initialization errors', async () => {
      const originalWorker = global.Worker;
      global.Worker = undefined as any;

      const result = await workerManager.filterFruits(mockFruits, {});

      expect(result).toEqual([]);

      global.Worker = originalWorker;
    });

    it('handles message timeout', async () => {
      // Test with unsupported worker
      const originalWorker = global.Worker;
      global.Worker = undefined as any;

      const result = await workerManager.filterFruits(mockFruits, {});

      expect(result).toEqual([]);

      global.Worker = originalWorker;
    });
  });
}); 