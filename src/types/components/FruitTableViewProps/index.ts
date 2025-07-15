import { Fruit } from '@/types/Fruit';
 
export interface FruitTableViewProps {
  fruits: Fruit[];
  onAddFruit: (fruit: Fruit) => void;
  onViewFruit?: (fruit: Fruit) => void;
} 