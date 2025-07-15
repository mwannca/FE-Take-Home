import { Fruit } from '@/types/Fruit';
 
export interface FruitListViewProps {
  fruits: Fruit[];
  onAddFruit: (fruit: Fruit) => void;
  onViewFruit?: (fruit: Fruit) => void;
} 