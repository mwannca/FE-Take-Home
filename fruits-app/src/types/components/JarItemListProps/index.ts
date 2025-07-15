import { JarItem } from '@/types/JarItem';
 
export interface JarItemListProps {
  jarItems: JarItem[];
  onRemoveItem: (fruitId: number) => void;
  onUpdateQuantity: (fruitId: number, quantity: number) => void;
} 