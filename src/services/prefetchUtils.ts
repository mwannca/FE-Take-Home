import { queryKeys } from '@/services/queryKeys';
import { fruitsApi } from '@/services/fruitsApi';

// Prefetch functions for better UX
export const prefetchFruits = async (queryClient: any) => {
  await queryClient.prefetchQuery({
    queryKey: queryKeys.fruits.list(),
    queryFn: fruitsApi.getAllFruits,
  });
};

export const prefetchFruitById = async (queryClient: any, id: number) => {
  await queryClient.prefetchQuery({
    queryKey: queryKeys.fruits.byId(id),
    queryFn: () => fruitsApi.getFruitById(id),
  });
}; 