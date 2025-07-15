import { groupFruitsByField, addFruitToJar, addGroupToJar } from './fruitUtils';
import { Fruit, JarItem } from '@/types';

const mockFruits: Fruit[] = [
  {
    id: 1,
    name: 'Apple',
    family: 'Rosaceae',
    order: 'Rosales',
    genus: 'Malus',
    calories: 52
  },
  {
    id: 2,
    name: 'Banana',
    family: 'Musaceae',
    order: 'Zingiberales',
    genus: 'Musa',
    calories: 89
  },
  {
    id: 3,
    name: 'Strawberry',
    family: 'Rosaceae',
    order: 'Rosales',
    genus: 'Fragaria',
    calories: 32
  }
];

describe('fruitUtils', () => {
  describe('groupFruitsByField', () => {
    it('returns All Fruits group for empty fruits array', () => {
      const result = groupFruitsByField([], 'None');
      expect(result).toEqual({ 'All Fruits': [] });
    });

    it('returns All Fruits group for None grouping', () => {
      const result = groupFruitsByField(mockFruits, 'None');
      expect(result).toEqual({ 'All Fruits': mockFruits });
    });

    it('groups fruits by family', () => {
      const result = groupFruitsByField(mockFruits, 'Family');
      expect(result).toEqual({
        'Rosaceae': [mockFruits[0], mockFruits[2]], // Apple, Strawberry
        'Musaceae': [mockFruits[1]] // Banana
      });
    });

    it('groups fruits by order', () => {
      const result = groupFruitsByField(mockFruits, 'Order');
      expect(result).toEqual({
        'Rosales': [mockFruits[0], mockFruits[2]], // Apple, Strawberry
        'Zingiberales': [mockFruits[1]] // Banana
      });
    });

    it('groups fruits by genus', () => {
      const result = groupFruitsByField(mockFruits, 'Genus');
      expect(result).toEqual({
        'Malus': [mockFruits[0]], // Apple
        'Musa': [mockFruits[1]], // Banana
        'Fragaria': [mockFruits[2]] // Strawberry
      });
    });

    it('handles fruits with same grouping values', () => {
      const fruitsWithSameFamily = [
        { ...mockFruits[0], family: 'Rosaceae' },
        { ...mockFruits[1], family: 'Rosaceae' }
      ];
      const result = groupFruitsByField(fruitsWithSameFamily, 'Family');
      expect(result).toEqual({
        'Rosaceae': fruitsWithSameFamily
      });
    });
  });

  describe('addFruitToJar', () => {
    it('adds new fruit to empty jar', () => {
      const jarItems: JarItem[] = [];
      const newFruit = mockFruits[0];
      const result = addFruitToJar(jarItems, newFruit);
      
      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        fruit: newFruit,
        quantity: 1
      });
    });

    it('increments quantity for existing fruit', () => {
      const existingJarItem: JarItem = {
        fruit: mockFruits[0],
        quantity: 2
      };
      const jarItems: JarItem[] = [existingJarItem];
      const result = addFruitToJar(jarItems, mockFruits[0]);
      
      expect(result).toHaveLength(1);
      expect(result[0].quantity).toBe(3);
    });

    it('adds different fruit to jar with existing items', () => {
      const existingJarItem: JarItem = {
        fruit: mockFruits[0],
        quantity: 1
      };
      const jarItems: JarItem[] = [existingJarItem];
      const result = addFruitToJar(jarItems, mockFruits[1]);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual(existingJarItem);
      expect(result[1]).toEqual({
        fruit: mockFruits[1],
        quantity: 1
      });
    });

    it('handles empty jar items array', () => {
      const result = addFruitToJar([], mockFruits[0]);
      expect(result).toHaveLength(1);
      expect(result[0].fruit).toEqual(mockFruits[0]);
      expect(result[0].quantity).toBe(1);
    });
  });

  describe('addGroupToJar', () => {
    it('adds all fruits from group to empty jar', () => {
      const jarItems: JarItem[] = [];
      const groupFruits = [mockFruits[0], mockFruits[1]];
      const result = addGroupToJar(jarItems, groupFruits);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        fruit: mockFruits[0],
        quantity: 1
      });
      expect(result[1]).toEqual({
        fruit: mockFruits[1],
        quantity: 1
      });
    });

    it('increments quantities for existing fruits in jar', () => {
      const existingJarItem: JarItem = {
        fruit: mockFruits[0],
        quantity: 2
      };
      const jarItems: JarItem[] = [existingJarItem];
      const groupFruits = [mockFruits[0], mockFruits[1]];
      const result = addGroupToJar(jarItems, groupFruits);
      
      expect(result).toHaveLength(2);
      expect(result[0].quantity).toBe(3); // Existing + 1
      expect(result[1].quantity).toBe(1); // New fruit
    });

    it('adds new fruits to jar with existing items', () => {
      const existingJarItem: JarItem = {
        fruit: mockFruits[0],
        quantity: 1
      };
      const jarItems: JarItem[] = [existingJarItem];
      const groupFruits = [mockFruits[1], mockFruits[2]];
      const result = addGroupToJar(jarItems, groupFruits);
      
      expect(result).toHaveLength(3);
      expect(result[0]).toEqual(existingJarItem);
      expect(result[1].fruit).toEqual(mockFruits[1]);
      expect(result[2].fruit).toEqual(mockFruits[2]);
    });

    it('handles empty jar items array', () => {
      const groupFruits = [mockFruits[0], mockFruits[1]];
      const result = addGroupToJar([], groupFruits);
      
      expect(result).toHaveLength(2);
      expect(result[0].fruit).toEqual(mockFruits[0]);
      expect(result[1].fruit).toEqual(mockFruits[1]);
    });

    it('handles empty group fruits array', () => {
      const jarItems: JarItem[] = [];
      const result = addGroupToJar(jarItems, []);
      
      expect(result).toEqual([]);
    });

    it('handles duplicate fruits in group', () => {
      const jarItems: JarItem[] = [];
      const groupFruits = [mockFruits[0], mockFruits[0]]; // Same fruit twice
      const result = addGroupToJar(jarItems, groupFruits);
      
      expect(result).toHaveLength(1);
      expect(result[0].quantity).toBe(2);
    });
  });
}); 