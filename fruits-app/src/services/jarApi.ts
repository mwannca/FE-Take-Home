import { Fruit, JarItem } from '@/types';

// Jar operations with optimistic updates
export const jarOperations = {
  // Add fruit to jar with optimistic update
  async addFruitToJar(fruit: Fruit, quantity: number = 1): Promise<JarItem> {
    const jarItem: JarItem = {
      fruit,
      quantity,
    };

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
    
    return jarItem;
  },

  // Remove fruit from jar
  async removeFruitFromJar(itemId: number): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
  },

  // Update fruit quantity
  async updateFruitQuantity(itemId: number, quantity: number): Promise<void> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
  },
}; 