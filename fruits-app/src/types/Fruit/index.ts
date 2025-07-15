export interface Fruit {
  id: number;
  name: string;
  family: string;
  order: string;
  genus: string;
  calories: number;
  nutritions?: {
    calories: number;
    fat: number;
    sugar: number;
    carbohydrates: number;
    protein: number;
  };
} 