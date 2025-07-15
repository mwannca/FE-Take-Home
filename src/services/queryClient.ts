import { QueryClient } from '@tanstack/react-query';

/**
 * React Query Client Configuration
 * 
 * This client provides:
 * - Intelligent caching with automatic background updates
 * - Retry logic for failed requests
 * - Optimistic updates
 * - Request deduplication
 * - Background refetching
 */

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000,
      
      // Keep data in cache for 10 minutes
      gcTime: 10 * 60 * 1000,
      
      // Retry failed requests up to 3 times
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error instanceof Error && error.message.includes('4')) {
          return false;
        }
        return failureCount < 3;
      },
      
      // Retry with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch on window focus (good for keeping data fresh)
      refetchOnWindowFocus: true,
      
      // Refetch on reconnect
      refetchOnReconnect: true,
      
      // Show loading state immediately
      refetchOnMount: true,
    },
    mutations: {
      // Retry mutations up to 2 times
      retry: 2,
      
      // Retry with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
  },
});

/**
 * Query Keys for consistent caching
 */
export const queryKeys = {
  fruits: {
    all: ['fruits'] as const,
    lists: () => [...queryKeys.fruits.all, 'list'] as const,
    list: (filters: string) => [...queryKeys.fruits.lists(), { filters }] as const,
    details: () => [...queryKeys.fruits.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.fruits.details(), id] as const,
  },
  jar: {
    all: ['jar'] as const,
    items: () => [...queryKeys.jar.all, 'items'] as const,
  },
} as const; 