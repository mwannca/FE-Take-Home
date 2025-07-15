import { renderHook, act, waitFor } from '@testing-library/react';
import { useFruitsApp } from './useFruitsApp';
import { getFruits } from '@/services/api';
import { addFruitToJar, addGroupToJar } from '@/utils/fruitUtils';
import { groupFruitsByField } from '@/utils/fruitUtils';

// Mock dependencies
jest.mock('../services/api');
jest.mock('../utils/fruitUtils');

const mockGetFruits = getFruits as jest.MockedFunction<typeof getFruits>;
const mockAddFruitToJar = addFruitToJar as jest.MockedFunction<typeof addFruitToJar>;
const mockAddGroupToJar = addGroupToJar as jest.MockedFunction<typeof addGroupToJar>;
const mockGroupFruitsByField = groupFruitsByField as jest.MockedFunction<typeof groupFruitsByField>;

const mockFruits = [
  {
    id: 1,
    name: 'Apple',
    family: 'Rosaceae',
    order: 'Rosales',
    genus: 'Malus',
    calories: 52
  },
  {
    id: 2,
    name: 'Banana',
    family: 'Musaceae',
    order: 'Zingiberales',
    genus: 'Musa',
    calories: 89
  }
];

describe('useFruitsApp', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetFruits.mockResolvedValue(mockFruits);
    mockAddFruitToJar.mockImplementation((jarItems, fruit) => [
      ...jarItems,
      { fruit, quantity: 1 }
    ]);
    mockAddGroupToJar.mockImplementation((jarItems, fruits) => [
      ...jarItems,
      ...fruits.map(fruit => ({ fruit, quantity: 1 }))
    ]);
    mockGroupFruitsByField.mockImplementation((fruits, groupBy) => {
      if (groupBy === 'Family') {
        return {
          Rosaceae: [mockFruits[0]],
          Musaceae: [mockFruits[1]],
        };
      }
      return {} as any; // Always return an object, type-safe for test
    });
  });

  it('initializes with default state', async () => {
    const { result } = renderHook(() => useFruitsApp());
    // Initial state before fetch completes
    expect(result.current.fruits).toEqual([]);
    expect(result.current.jarItems).toEqual([]);
    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.groupBy).toBe('None');
    expect(result.current.viewMode).toBe('list');
    expect(result.current.showChart).toBe(false);

    // After fetch completes
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.fruits).toEqual(mockFruits);
  });

  it('fetches fruits on mount', async () => {
    const { result } = await act(async () => renderHook(() => useFruitsApp()));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockGetFruits).toHaveBeenCalledTimes(1);
    expect(result.current.fruits).toEqual(mockFruits);
    expect(result.current.error).toBeNull();
  });

  it('handles API errors', async () => {
    const errorMessage = 'Failed to fetch fruits';
    mockGetFruits.mockRejectedValue(new Error(errorMessage));

    const { result } = await act(async () => renderHook(() => useFruitsApp()));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe(errorMessage);
    expect(result.current.fruits).toEqual([]);
  });

  it('handles add fruit to jar', async () => {
    const { result } = await act(async () => renderHook(() => useFruitsApp()));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.handleAddFruit(mockFruits[0]);
    });

    expect(mockAddFruitToJar).toHaveBeenCalledWith([], mockFruits[0]);
  });

  it('handles add group to jar', async () => {
    const { result } = await act(async () => renderHook(() => useFruitsApp()));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.handleAddGroup([mockFruits[0], mockFruits[1]]);
    });

    expect(mockAddGroupToJar).toHaveBeenCalledWith([], [mockFruits[0], mockFruits[1]]);
  });

  it('handles remove from jar', async () => {
    const { result } = await act(async () => renderHook(() => useFruitsApp()));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Add an item first
    act(() => {
      result.current.handleAddFruit(mockFruits[0]);
    });

    // Then remove it
    act(() => {
      result.current.handleRemoveFromJar(1);
    });

    expect(result.current.jarItems).toEqual([]);
  });

  it('handles update quantity', async () => {
    const { result } = await act(async () => renderHook(() => useFruitsApp()));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Add an item first
    act(() => {
      result.current.handleAddFruit(mockFruits[0]);
    });

    // Update quantity
    act(() => {
      result.current.handleUpdateQuantity(1, 3);
    });

    expect(result.current.jarItems[0].quantity).toBe(3);
  });

  it('removes item when quantity is set to 0', async () => {
    const { result } = await act(async () => renderHook(() => useFruitsApp()));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Add an item first
    act(() => {
      result.current.handleAddFruit(mockFruits[0]);
    });

    // Set quantity to 0
    act(() => {
      result.current.handleUpdateQuantity(1, 0);
    });

    expect(result.current.jarItems).toEqual([]);
  });

  it('handles group by changes', async () => {
    const { result } = await act(async () => renderHook(() => useFruitsApp()));

    act(() => {
      result.current.setGroupBy('Family');
    });

    expect(result.current.groupBy).toBe('Family');
  });

  it('handles view mode changes', async () => {
    const { result } = await act(async () => renderHook(() => useFruitsApp()));

    act(() => {
      result.current.setViewMode('table');
    });

    expect(result.current.viewMode).toBe('table');
  });

  it('handles chart toggle', async () => {
    const { result } = await act(async () => renderHook(() => useFruitsApp()));

    act(() => {
      result.current.setShowChart(true);
    });

    expect(result.current.showChart).toBe(true);
  });

  it('refetches data when refetch is called', async () => {
    const { result } = await act(async () => renderHook(() => useFruitsApp()));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Clear the mock to verify it's called again
    mockGetFruits.mockClear();

    act(() => {
      result.current.refetch();
    });

    expect(mockGetFruits).toHaveBeenCalledTimes(1);
  });

  it('groups fruits correctly', async () => {
    const { result } = await act(async () => renderHook(() => useFruitsApp()));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify fruits are loaded
    expect(result.current.fruits).toEqual(mockFruits);

    act(() => {
      result.current.setGroupBy('Family');
    });

    // Wait for the state update to complete
    await waitFor(() => {
      expect(result.current.groupBy).toBe('Family');
    });

    // Check that groupedFruits is calculated correctly
    await waitFor(() => {
      const groupedFruits = result.current.groupedFruits;
      expect(groupedFruits).toBeDefined();
      expect(groupedFruits).toHaveProperty('Rosaceae');
      expect(groupedFruits).toHaveProperty('Musaceae');
    });
  });
}); 