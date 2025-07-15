import { JarItem } from '@/types/JarItem';

export interface JarProps {
  jarItems: JarItem[];
  showChart: boolean;
  onRemoveItem: (fruitId: number) => void;
  onUpdateQuantity: (fruitId: number, quantity: number) => void;
  onToggleChart: () => void;
} 