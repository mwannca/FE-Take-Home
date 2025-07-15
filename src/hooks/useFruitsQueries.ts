import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/services/queryKeys';
import { fruitsApi } from '@/services/fruitsApi';

// React Query hooks for fruits
export const useFruits = () => {
  return useQuery({
    queryKey: queryKeys.fruits.list(),
    queryFn: fruitsApi.getAllFruits,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
    retry: (failureCount, error) => {
      // Don't retry on 4xx errors
      if (error instanceof Error && error.message.includes('4')) {
        return false;
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useFruitsWithSearch = (searchQuery: string) => {
  return useQuery({
    queryKey: queryKeys.fruits.search(searchQuery),
    queryFn: () => fruitsApi.searchFruits(searchQuery),
    enabled: searchQuery.length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
    gcTime: 5 * 60 * 1000,    // 5 minutes
  });
};

export const useFruitById = (id: number) => {
  return useQuery({
    queryKey: queryKeys.fruits.byId(id),
    queryFn: () => fruitsApi.getFruitById(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes for individual fruits
    gcTime: 30 * 60 * 1000,    // 30 minutes
  });
}; 