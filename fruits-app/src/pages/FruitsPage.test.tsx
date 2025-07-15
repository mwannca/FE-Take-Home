import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import FruitsPage from './FruitsPage';

// Mock the hook
jest.mock('../hooks/useFruitsApp');

// Mock components to simplify testing
jest.mock('../components/FruitList', () => ({
  __esModule: true,
  default: ({ onAddFruit, onAddGroup, onGroupByChange, onViewModeChange }: any) => (
    <div data-testid="fruit-list">
      <button onClick={() => onAddFruit({ id: 1, name: 'Apple', calories: 52 })}>
        Add Apple
      </button>
      <button onClick={() => onAddGroup([{ id: 1, name: 'Apple', calories: 52 }])}>
        Add Group
      </button>
      <select onChange={(e) => onGroupByChange(e.target.value)}>
        <option value="None">None</option>
        <option value="Family">Family</option>
      </select>
      <button onClick={() => onViewModeChange('table')}>Switch to Table</button>
    </div>
  ),
  FruitList: ({ onAddFruit, onAddGroup, onGroupByChange, onViewModeChange }: any) => (
    <div data-testid="fruit-list">
      <button onClick={() => onAddFruit({ id: 1, name: 'Apple', calories: 52 })}>
        Add Apple
      </button>
      <button onClick={() => onAddGroup([{ id: 1, name: 'Apple', calories: 52 }])}>
        Add Group
      </button>
      <select onChange={(e) => onGroupByChange(e.target.value)}>
        <option value="None">None</option>
        <option value="Family">Family</option>
      </select>
      <button onClick={() => onViewModeChange('table')}>Switch to Table</button>
    </div>
  ),
}));

jest.mock('../components/Jar', () => ({
  __esModule: true,
  default: ({ onRemoveItem, onUpdateQuantity, onToggleChart }: any) => (
    <div data-testid="jar">
      <button onClick={() => onRemoveItem(1)}>Remove Item</button>
      <button onClick={() => onUpdateQuantity(1, 3)}>Update Quantity</button>
      <button onClick={onToggleChart}>Toggle Chart</button>
    </div>
  ),
  Jar: ({ onRemoveItem, onUpdateQuantity, onToggleChart }: any) => (
    <div data-testid="jar">
      <button onClick={() => onRemoveItem(1)}>Remove Item</button>
      <button onClick={() => onUpdateQuantity(1, 3)}>Update Quantity</button>
      <button onClick={onToggleChart}>Toggle Chart</button>
    </div>
  ),
}));

jest.mock('../components/common', () => ({
  LoadingSpinner: ({ message }: any) => <div data-testid="loading">{message}</div>,
  ErrorDisplay: ({ error, onRetry }: any) => (
    <div data-testid="error">
      {error}
      <button onClick={onRetry}>Retry</button>
    </div>
  ),
  FruitDetailsModal: () => <div data-testid="fruit-details-modal" />, 
  SearchInput: () => <input data-testid="search-input" />,
}));

const mockUseFruitsApp = require('../hooks/useFruitsApp').useFruitsApp;

const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('FruitsPage', () => {
  const mockFruits = [
    { id: 1, name: 'Apple', family: 'Rosaceae', order: 'Rosales', genus: 'Malus', calories: 52 },
    { id: 2, name: 'Banana', family: 'Musaceae', order: 'Zingiberales', genus: 'Musa', calories: 89 }
  ];

  const mockJarItems = [
    { fruit: mockFruits[0], quantity: 2 }
  ];

  const defaultMockReturn = {
    fruits: mockFruits,
    jarItems: mockJarItems,
    loading: false,
    error: null,
    groupBy: 'None',
    viewMode: 'list',
    showChart: false,
    setGroupBy: jest.fn(),
    setViewMode: jest.fn(),
    setShowChart: jest.fn(),
    handleAddFruit: jest.fn(),
    handleAddGroup: jest.fn(),
    handleRemoveFromJar: jest.fn(),
    handleUpdateQuantity: jest.fn(),
    refetch: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseFruitsApp.mockReturnValue(defaultMockReturn);
  });

  it('renders loading state', () => {
    mockUseFruitsApp.mockReturnValue({
      ...defaultMockReturn,
      loading: true
    });

    renderWithRouter(<FruitsPage />);
    expect(screen.getByTestId('loading')).toBeInTheDocument();
    expect(screen.getByText('Loading fruits...')).toBeInTheDocument();
  });

  it('renders error state', () => {
    mockUseFruitsApp.mockReturnValue({
      ...defaultMockReturn,
      error: 'Failed to fetch fruits'
    });

    renderWithRouter(<FruitsPage />);
    expect(screen.getByTestId('error')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch fruits')).toBeInTheDocument();
  });

  it('renders fruits page when data is loaded', () => {
    renderWithRouter(<FruitsPage />);
    expect(screen.getByText('🍎 Fruits Explorer')).toBeInTheDocument();
    expect(screen.getByText('Discover and collect your favorite fruits!')).toBeInTheDocument();
    expect(screen.getByTestId('fruit-list')).toBeInTheDocument();
    expect(screen.getByTestId('jar')).toBeInTheDocument();
  });

  it('handles add fruit interaction', () => {
    const mockHandleAddFruit = jest.fn();
    mockUseFruitsApp.mockReturnValue({
      ...defaultMockReturn,
      handleAddFruit: mockHandleAddFruit
    });

    renderWithRouter(<FruitsPage />);
    fireEvent.click(screen.getByText('Add Apple'));
    expect(mockHandleAddFruit).toHaveBeenCalledWith({ id: 1, name: 'Apple', calories: 52 });
  });

  it('handles add group interaction', () => {
    const mockHandleAddGroup = jest.fn();
    mockUseFruitsApp.mockReturnValue({
      ...defaultMockReturn,
      handleAddGroup: mockHandleAddGroup
    });

    renderWithRouter(<FruitsPage />);
    fireEvent.click(screen.getByText('Add Group'));
    expect(mockHandleAddGroup).toHaveBeenCalledWith([{ id: 1, name: 'Apple', calories: 52 }]);
  });

  it('handles group by change', () => {
    const mockSetGroupBy = jest.fn();
    mockUseFruitsApp.mockReturnValue({
      ...defaultMockReturn,
      setGroupBy: mockSetGroupBy
    });

    renderWithRouter(<FruitsPage />);
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'Family' } });
    expect(mockSetGroupBy).toHaveBeenCalledWith('Family');
  });

  it('handles view mode change', () => {
    const mockSetViewMode = jest.fn();
    mockUseFruitsApp.mockReturnValue({
      ...defaultMockReturn,
      setViewMode: mockSetViewMode
    });

    renderWithRouter(<FruitsPage />);
    fireEvent.click(screen.getByText('Switch to Table'));
    expect(mockSetViewMode).toHaveBeenCalledWith('table');
  });

  it('handles jar interactions', () => {
    const mockHandleRemoveFromJar = jest.fn();
    const mockHandleUpdateQuantity = jest.fn();
    const mockSetShowChart = jest.fn();

    mockUseFruitsApp.mockReturnValue({
      ...defaultMockReturn,
      handleRemoveFromJar: mockHandleRemoveFromJar,
      handleUpdateQuantity: mockHandleUpdateQuantity,
      setShowChart: mockSetShowChart
    });

    renderWithRouter(<FruitsPage />);
    
    fireEvent.click(screen.getByText('Remove Item'));
    expect(mockHandleRemoveFromJar).toHaveBeenCalledWith(1);

    fireEvent.click(screen.getByText('Update Quantity'));
    expect(mockHandleUpdateQuantity).toHaveBeenCalledWith(1, 3);

    fireEvent.click(screen.getByText('Toggle Chart'));
    expect(mockSetShowChart).toHaveBeenCalled();
  });

  it('handles retry on error', () => {
    const mockRefetch = jest.fn();
    mockUseFruitsApp.mockReturnValue({
      ...defaultMockReturn,
      error: 'Failed to fetch fruits',
      refetch: mockRefetch
    });

    renderWithRouter(<FruitsPage />);
    fireEvent.click(screen.getByText('Retry'));
    expect(mockRefetch).toHaveBeenCalled();
  });
}); 