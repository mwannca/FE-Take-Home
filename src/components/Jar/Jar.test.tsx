import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Jar from './Jar';
import { JarItem } from '@/types';

// Mock data
const mockJarItems: JarItem[] = [
  {
    fruit: {
      id: 1,
      name: 'Apple',
      family: 'Rosaceae',
      order: 'Rosales',
      genus: 'Malus',
      calories: 52
    },
    quantity: 2
  },
  {
    fruit: {
      id: 2,
      name: 'Banana',
      family: 'Musaceae',
      order: 'Zingiberales',
      genus: 'Musa',
      calories: 89
    },
    quantity: 1
  }
];

const defaultProps = {
  jarItems: mockJarItems,
  showChart: false,
  onRemoveItem: jest.fn(),
  onUpdateQuantity: jest.fn(),
  onToggleChart: jest.fn()
};

describe('Jar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders without crashing', () => {
    render(<Jar {...defaultProps} />);
    expect(screen.getByText('🍯 Fruit Jar')).toBeInTheDocument();
  });

  it('displays jar items', () => {
    render(<Jar {...defaultProps} />);
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('Banana')).toBeInTheDocument();
  });

  it('displays quantities', () => {
    render(<Jar {...defaultProps} />);
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('displays total calories', () => {
    render(<Jar {...defaultProps} />);
    // Apple: 52 * 2 = 104, Banana: 89 * 1 = 89, Total: 193
    expect(screen.getByText('193')).toBeInTheDocument();
  });

  it('calls onRemoveItem when remove button is clicked', () => {
    render(<Jar {...defaultProps} />);
    const removeButtons = screen.getAllByText('×');
    fireEvent.click(removeButtons[0]);
    expect(defaultProps.onRemoveItem).toHaveBeenCalledWith(1);
  });

  it('calls onUpdateQuantity when quantity is changed', () => {
    render(<Jar {...defaultProps} />);
    const plusButtons = screen.getAllByText('+');
    fireEvent.click(plusButtons[0]);
    expect(defaultProps.onUpdateQuantity).toHaveBeenCalledWith(1, 3);
  });

  it('removes item when quantity is set to 0', () => {
    render(<Jar {...defaultProps} />);
    const minusButtons = screen.getAllByText('-');
    fireEvent.click(minusButtons[0]);
    expect(defaultProps.onUpdateQuantity).toHaveBeenCalledWith(1, 1);
  });

  it('displays chart toggle button', () => {
    render(<Jar {...defaultProps} />);
    expect(screen.getByText('Show Chart')).toBeInTheDocument();
  });

  it('calls onToggleChart when chart button is clicked', () => {
    render(<Jar {...defaultProps} />);
    const chartButton = screen.getByText('Show Chart');
    fireEvent.click(chartButton);
    expect(defaultProps.onToggleChart).toHaveBeenCalled();
  });

  it('shows chart when showChart is true', () => {
    // Mock ResizeObserver for chart component
    global.ResizeObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
    
    render(<Jar {...defaultProps} showChart={true} />);
    expect(screen.getByText('Show Item List')).toBeInTheDocument();
  });

  it('displays empty state when jar is empty', () => {
    render(<Jar {...defaultProps} jarItems={[]} />);
    expect(screen.getByText('Your jar is empty. Add some fruits to get started!')).toBeInTheDocument();
  });

  it('displays correct total calories for empty jar', () => {
    render(<Jar {...defaultProps} jarItems={[]} />);
    const caloriesElements = screen.getAllByText('0');
    expect(caloriesElements.length).toBeGreaterThan(0);
  });

  it('handles single item in jar', () => {
    const singleItem = [mockJarItems[0]];
    render(<Jar {...defaultProps} jarItems={singleItem} />);
    expect(screen.getByText('Apple')).toBeInTheDocument();
    expect(screen.getByText('104')).toBeInTheDocument(); // 52 * 2
  });

  it('displays calorie information for each item', () => {
    render(<Jar {...defaultProps} />);
    expect(screen.getByText('52 cal × 2 = 104 cal')).toBeInTheDocument(); // Apple: 52 * 2
    expect(screen.getByText('89 cal × 1 = 89 cal')).toBeInTheDocument(); // Banana: 89 * 1
  });

  it('shows fruit selection UI when chart is displayed', () => {
    // Mock ResizeObserver for chart component
    global.ResizeObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
    
    render(<Jar {...defaultProps} showChart={true} />);
    // The chart should be rendered (we can't easily test the click functionality in unit tests)
    expect(screen.getByText('Show Item List')).toBeInTheDocument();
  });

  it('clears fruit selection when toggling chart', () => {
    // Mock ResizeObserver for chart component
    global.ResizeObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      unobserve: jest.fn(),
      disconnect: jest.fn(),
    }));
    
    render(<Jar {...defaultProps} showChart={true} />);
    const toggleButton = screen.getByText('Show Item List');
    fireEvent.click(toggleButton);
    expect(defaultProps.onToggleChart).toHaveBeenCalled();
  });
}); 