import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FruitList from './FruitList';
import { Fruit, GroupByOption, ViewMode } from '@/types';
import * as fruitUtils from '@/utils/fruitUtils';

// Mock the groupFruitsByField function
jest.mock('@/utils/fruitUtils', () => ({
  ...jest.requireActual('@/utils/fruitUtils'),
  groupFruitsByField: jest.fn()
}));

const mockGroupFruitsByField = fruitUtils.groupFruitsByField as jest.MockedFunction<typeof fruitUtils.groupFruitsByField>;

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
  },
  {
    id: 3,
    name: 'Strawberry',
    family: 'Rosaceae',
    order: 'Rosales',
    genus: 'Fragaria',
    calories: 32
  }
];

const defaultProps = {
  fruits: mockFruits,
  groupBy: 'None' as GroupByOption,
  viewMode: 'list' as ViewMode,
  onAddFruit: jest.fn(),
  onAddGroup: jest.fn(),
  onViewFruit: jest.fn(),
  onGroupByChange: jest.fn(),
  onViewModeChange: jest.fn(),
};

describe('FruitList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Set up default mock implementation
    mockGroupFruitsByField.mockImplementation((fruits, groupBy) => {
      if (groupBy === 'Family') {
        return {
          Rosaceae: [mockFruits[0], mockFruits[2]],
          Musaceae: [mockFruits[1]],
        } as { [key: string]: Fruit[] };
      }
      if (groupBy === 'Order') {
        return {
          Rosales: [mockFruits[0], mockFruits[2]],
          Zingiberales: [mockFruits[1]],
        } as { [key: string]: Fruit[] };
      }
      if (groupBy === 'Genus') {
        return {
          Malus: [mockFruits[0]],
          Musa: [mockFruits[1]],
          Fragaria: [mockFruits[2]],
        } as { [key: string]: Fruit[] };
      }
      return {} as { [key: string]: Fruit[] };
    });
  });

  it('renders without crashing', () => {
    render(<FruitList {...defaultProps} />);
    expect(screen.getByText('Apple')).toBeInTheDocument();
  });

  it('renders fruits in list view by default', () => {
    render(<FruitList {...defaultProps} />);
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('52 cal')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.getByText('89 cal')).toBeInTheDocument();
    expect(screen.getByText('Strawberry')).toBeInTheDocument();
    expect(screen.getByText('32 cal')).toBeInTheDocument();
  });

  it('renders fruits in table view when viewMode is table', () => {
    render(<FruitList {...defaultProps} viewMode="table" />);
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
    expect(screen.getByText('Strawberry')).toBeInTheDocument();
  });

  it('calls onAddFruit when add button is clicked', () => {
    render(<FruitList {...defaultProps} />);
    const addButtons = screen.getAllByText('Add');
    fireEvent.click(addButtons[0]);
    expect(defaultProps.onAddFruit).toHaveBeenCalledWith(mockFruits[0]);
  });

  it('calls onGroupByChange when group by is changed', () => {
    render(<FruitList {...defaultProps} />);
    const groupBySelect = screen.getByLabelText('Group by:');
    fireEvent.change(groupBySelect, { target: { value: 'Family' } });
    expect(defaultProps.onGroupByChange).toHaveBeenCalledWith('Family');
  });

  it('calls onViewModeChange when view mode is changed', () => {
    render(<FruitList {...defaultProps} />);
    const viewModeSelect = screen.getByLabelText('View:');
    fireEvent.change(viewModeSelect, { target: { value: 'table' } });
    expect(defaultProps.onViewModeChange).toHaveBeenCalledWith('table');
  });

  it('handles undefined fruits', () => {
    render(<FruitList {...defaultProps} fruits={undefined as any} />);
    expect(screen.getByText('No fruits available. Please check your connection.')).toBeInTheDocument();
  });

  it('handles empty fruits array', () => {
    render(<FruitList {...defaultProps} fruits={[]} />);
    expect(screen.getByText('No fruits available. Please check your connection.')).toBeInTheDocument();
  });

  it('groups fruits by family when groupBy is Family', () => {
    render(<FruitList {...defaultProps} groupBy="Family" />);
    // Find and click the group header to expand it
    const groupHeader = screen.getByText(/Rosaceae \(\d+\)/);
    fireEvent.click(groupHeader);
    expect(screen.getByText(/Rosaceae \(\d+\)/)).toBeInTheDocument();
    expect(screen.getByText(/Musaceae \(\d+\)/)).toBeInTheDocument();
  });

  it('groups fruits by order when groupBy is Order', () => {
    render(<FruitList {...defaultProps} groupBy="Order" />);
    const groupHeader = screen.getByText(/Rosales \(\d+\)/);
    fireEvent.click(groupHeader);
    expect(screen.getByText(/Rosales \(\d+\)/)).toBeInTheDocument();
    expect(screen.getByText(/Zingiberales \(\d+\)/)).toBeInTheDocument();
  });

  it('groups fruits by genus when groupBy is Genus', () => {
    render(<FruitList {...defaultProps} groupBy="Genus" />);
    // Find and click the group header to expand it
    const groupHeader = screen.getByText(/Malus \(\d+\)/);
    fireEvent.click(groupHeader);
    expect(screen.getByText(/Malus \(\d+\)/)).toBeInTheDocument();
    expect(screen.getByText(/Musa \(\d+\)/)).toBeInTheDocument();
    expect(screen.getByText(/Fragaria \(\d+\)/)).toBeInTheDocument();
  });

  it('calls onAddGroup when group Add button is clicked', () => {
    render(<FruitList {...defaultProps} groupBy="Family" />);
    const groupHeader = screen.getByText(/Rosaceae \(\d+\)/);
    fireEvent.click(groupHeader);
    const groupAddButtons = screen.getAllByText('Add All');
    fireEvent.click(groupAddButtons[0]);
    expect(defaultProps.onAddGroup).toHaveBeenCalledWith([mockFruits[0], mockFruits[2]]);
  });
}); 