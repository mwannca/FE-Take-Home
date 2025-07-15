import { Fruit } from '@/types/Fruit';
 
export interface ApiResponse {
  data: Fruit[];
  success: boolean;
  message?: string;
} 