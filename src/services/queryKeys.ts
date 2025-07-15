// Query keys for React Query
export const queryKeys = {
  fruits: {
    all: () => ['fruits'] as const,
    list: () => [...queryKeys.fruits.all(), 'list'] as const,
    search: (query: string) => [...queryKeys.fruits.list(), 'search', query] as const,
    byId: (id: number) => [...queryKeys.fruits.all(), 'detail', id] as const,
  },
  jar: {
    items: () => ['jar', 'items'] as const,
    total: () => ['jar', 'total'] as const,
    chart: () => ['jar', 'chart'] as const,
  },
} as const; 