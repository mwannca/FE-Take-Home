import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Fruit, JarItem } from '@/types';
import { queryKeys } from '@/services/queryKeys';
import { jarOperations } from '@/services/jarApi';
import { sentryManager } from '@/utils/sentry';
import { rumMonitor } from '@/utils/rum';

// Jar operations with optimistic updates
export const useJarOperations = () => {
  const queryClient = useQueryClient();

  const addFruit = useMutation({
    mutationFn: async ({ fruit, quantity }: { fruit: Fruit; quantity: number }) => {
      return jarOperations.addFruitToJar(fruit, quantity);
    },
    onMutate: async ({ fruit, quantity }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.jar.items() });

      // Snapshot previous value
      const previousJarItems = queryClient.getQueryData<JarItem[]>(queryKeys.jar.items()) || [];

      // Optimistically update
      const newItem: JarItem = { fruit, quantity };
      queryClient.setQueryData<JarItem[]>(queryKeys.jar.items(), (old) => {
        const existing = old?.find(item => item.fruit.id === fruit.id);
        if (existing) {
          return old?.map(item => 
            item.fruit.id === fruit.id 
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ) || [];
        }
        return [...(old || []), newItem];
      });

      // Track user action
      rumMonitor.trackUserJourney('add_fruit_to_jar', { fruitId: fruit.id, quantity });
      sentryManager.trackUserAction('add_fruit_to_jar', { fruitId: fruit.id, quantity });

      return { previousJarItems };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousJarItems) {
        queryClient.setQueryData(queryKeys.jar.items(), context.previousJarItems);
      }
      
      sentryManager.captureException(err as Error, {
        component: 'jarOperations',
        action: 'addFruit',
        data: variables,
      });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: queryKeys.jar.items() });
    },
  });

  const removeFruit = useMutation({
    mutationFn: async (itemId: number) => {
      return jarOperations.removeFruitFromJar(itemId);
    },
    onMutate: async (itemId) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.jar.items() });
      const previousJarItems = queryClient.getQueryData<JarItem[]>(queryKeys.jar.items()) || [];

      queryClient.setQueryData<JarItem[]>(queryKeys.jar.items(), (old) => {
        return old?.filter(item => item.fruit.id !== itemId) || [];
      });

      rumMonitor.trackUserJourney('remove_fruit_from_jar', { itemId });
      sentryManager.trackUserAction('remove_fruit_from_jar', { itemId });

      return { previousJarItems };
    },
    onError: (err, variables, context) => {
      if (context?.previousJarItems) {
        queryClient.setQueryData(queryKeys.jar.items(), context.previousJarItems);
      }
      
      sentryManager.captureException(err as Error, {
        component: 'jarOperations',
        action: 'removeFruit',
        data: { itemId: variables },
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jar.items() });
    },
  });

  const updateQuantity = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: number; quantity: number }) => {
      return jarOperations.updateFruitQuantity(itemId, quantity);
    },
    onMutate: async ({ itemId, quantity }) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.jar.items() });
      const previousJarItems = queryClient.getQueryData<JarItem[]>(queryKeys.jar.items()) || [];

      queryClient.setQueryData<JarItem[]>(queryKeys.jar.items(), (old) => {
        return old?.map(item => 
          item.fruit.id === itemId 
            ? { ...item, quantity }
            : item
        ) || [];
      });

      rumMonitor.trackUserJourney('update_fruit_quantity', { itemId, quantity });
      sentryManager.trackUserAction('update_fruit_quantity', { itemId, quantity });

      return { previousJarItems };
    },
    onError: (err, variables, context) => {
      if (context?.previousJarItems) {
        queryClient.setQueryData(queryKeys.jar.items(), context.previousJarItems);
      }
      
      sentryManager.captureException(err as Error, {
        component: 'jarOperations',
        action: 'updateQuantity',
        data: variables,
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.jar.items() });
    },
  });

  return {
    addFruit,
    removeFruit,
    updateQuantity,
  };
}; 