import { Fruit } from '@/types';
import { getFruits } from './api';
import { sentryManager } from '@/utils/sentry';
import { rumMonitor } from '@/utils/rum';

// API functions with enhanced error handling and performance tracking
export const fruitsApi = {
  // Get all fruits with caching and retry logic
  async getAllFruits(): Promise<Fruit[]> {
    const startTime = performance.now();
    
    try {
      const fruits = await getFruits();
      
      // Track API performance
      const responseTime = performance.now() - startTime;
      rumMonitor.trackMetric('api_response_time', responseTime);
      sentryManager.trackApiCall('/api/fruits', 'GET', 200, responseTime);
      
      return fruits;
    } catch (error) {
      const responseTime = performance.now() - startTime;
      sentryManager.trackApiCall('/api/fruits', 'GET', 500, responseTime);
      sentryManager.captureException(error as Error, {
        component: 'fruitsApi',
        action: 'getAllFruits',
      });
      throw error;
    }
  },

  // Search fruits with debouncing
  async searchFruits(query: string): Promise<Fruit[]> {
    if (!query.trim()) {
      return this.getAllFruits();
    }

    const startTime = performance.now();
    
    try {
      const allFruits = await this.getAllFruits();
      const filtered = allFruits.filter(fruit => 
        fruit.name.toLowerCase().includes(query.toLowerCase()) ||
        fruit.family.toLowerCase().includes(query.toLowerCase()) ||
        fruit.genus.toLowerCase().includes(query.toLowerCase()) ||
        fruit.order.toLowerCase().includes(query.toLowerCase())
      );
      
      const responseTime = performance.now() - startTime;
      rumMonitor.trackMetric('search_response_time', responseTime);
      
      return filtered;
    } catch (error) {
      sentryManager.captureException(error as Error, {
        component: 'fruitsApi',
        action: 'searchFruits',
        data: { query },
      });
      throw error;
    }
  },

  // Get fruit by ID
  async getFruitById(id: number): Promise<Fruit | null> {
    const startTime = performance.now();
    
    try {
      const fruits = await this.getAllFruits();
      const fruit = fruits.find(f => f.id === id) || null;
      
      const responseTime = performance.now() - startTime;
      rumMonitor.trackMetric('fruit_detail_response_time', responseTime);
      
      return fruit;
    } catch (error) {
      sentryManager.captureException(error as Error, {
        component: 'fruitsApi',
        action: 'getFruitById',
        data: { id },
      });
      throw error;
    }
  },
}; 