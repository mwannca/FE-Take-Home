import { Fruit, GroupedFruits, GroupByOption, JarItem } from '@/types';

export const groupFruitsByField = (fruits: Fruit[], groupBy: GroupByOption): GroupedFruits => {
  if (groupBy === 'None') {
    return { 'All Fruits': fruits };
  }

  return fruits.reduce((grouped, fruit) => {
    const key = fruit[groupBy.toLowerCase() as keyof Fruit] as string;
    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(fruit);
    return grouped;
  }, {} as GroupedFruits);
};

export const calculateTotalCalories = (jarItems: JarItem[]): number => {
  return jarItems.reduce((total, item) => {
    return total + (item.fruit.calories * item.quantity);
  }, 0);
};

export const addFruitToJar = (jarItems: JarItem[], fruit: Fruit): JarItem[] => {
  const existingItem = jarItems.find(item => item.fruit.id === fruit.id);
  
  if (existingItem) {
    return jarItems.map(item => 
      item.fruit.id === fruit.id 
        ? { ...item, quantity: item.quantity + 1 }
        : item
    );
  }
  
  return [...jarItems, { fruit, quantity: 1 }];
};

export const addGroupToJar = (jarItems: JarItem[], fruits: Fruit[]): JarItem[] => {
  let newJarItems = [...jarItems];
  
  fruits.forEach(fruit => {
    newJarItems = addFruitToJar(newJarItems, fruit);
  });
  
  return newJarItems;
}; 