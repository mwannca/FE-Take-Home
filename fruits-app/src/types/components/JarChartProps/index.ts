import { JarItem } from '@/types/JarItem';
 
export interface JarChartProps {
  jarItems: JarItem[];
  onFruitSelect?: (fruitId: number) => void;
  selectedFruit?: number | null;
} 