import { useState, useEffect, useCallback, useMemo } from 'react';
import { Fruit, JarItem, GroupByOption, ViewMode } from '@/types';
import { getFruits } from '@/services/api';
import { groupFruitsByField, addFruitToJar, addGroupToJar } from '@/utils/fruitUtils';
import { useDebounce } from './useDebounce';

export const useFruitsApp = () => {
  const [fruits, setFruits] = useState<Fruit[]>([]);
  const [jarItems, setJarItems] = useState<JarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [groupBy, setGroupBy] = useState<GroupByOption>('None');
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [showChart, setShowChart] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal state
  const [selectedFruit, setSelectedFruit] = useState<Fruit | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Debounce search query for better performance
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const fetchFruits = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getFruits();
      setFruits(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFruits();
  }, [fetchFruits]);

  // Filter fruits based on search query
  const filteredFruits = useMemo(() => {
    if (!debouncedSearchQuery.trim()) {
      return fruits;
    }
    
    const query = debouncedSearchQuery.toLowerCase();
    return fruits.filter(fruit => 
      fruit.name.toLowerCase().includes(query) ||
      fruit.family.toLowerCase().includes(query) ||
      fruit.genus.toLowerCase().includes(query) ||
      fruit.order.toLowerCase().includes(query)
    );
  }, [fruits, debouncedSearchQuery]);

  const handleAddFruit = useCallback((fruit: Fruit) => {
    setJarItems(prev => addFruitToJar(prev, fruit));
  }, []);

  const handleAddGroup = useCallback((groupFruits: Fruit[]) => {
    setJarItems(prev => addGroupToJar(prev, groupFruits));
  }, []);

  const handleRemoveFromJar = useCallback((fruitId: number) => {
    setJarItems(prev => prev.filter(item => item.fruit.id !== fruitId));
  }, []);

  const handleUpdateQuantity = useCallback((fruitId: number, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveFromJar(fruitId);
      return;
    }
    
    setJarItems(prev => prev.map(item => 
      item.fruit.id === fruitId 
        ? { ...item, quantity }
        : item
    ));
  }, [handleRemoveFromJar]);

  // Modal handlers
  const handleViewFruit = useCallback((fruit: Fruit) => {
    setSelectedFruit(fruit);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedFruit(null);
  }, []);

  const handleAddToJarFromModal = useCallback((fruit: Fruit) => {
    handleAddFruit(fruit);
    handleCloseModal();
  }, [handleAddFruit, handleCloseModal]);

  // Search handlers
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const groupedFruits = groupFruitsByField(filteredFruits, groupBy);

  return {
    fruits: filteredFruits,
    allFruits: fruits, // Keep original fruits for reference
    jarItems,
    loading,
    error,
    groupBy,
    viewMode,
    showChart,
    searchQuery,
    groupedFruits,
    // Modal state
    selectedFruit,
    isModalOpen,
    // Setters
    setGroupBy,
    setViewMode,
    setShowChart,
    // Handlers
    handleAddFruit,
    handleAddGroup,
    handleRemoveFromJar,
    handleUpdateQuantity,
    handleViewFruit,
    handleCloseModal,
    handleAddToJarFromModal,
    handleSearch,
    refetch: fetchFruits,
  };
}; 