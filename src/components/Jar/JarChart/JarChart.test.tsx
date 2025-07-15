import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { JarChart } from './index';
import { JarItem } from '@/types';

// Mock Recharts components
jest.mock('recharts', () => ({
  PieChart: ({ children }: { children: React.ReactNode }) => <div data-testid="pie-chart">{children}</div>,
  Pie: ({ data, dataKey, nameKey, onClick }: any) => (
    <div data-testid="pie-segments">
      {data?.map((item: any, index: number) => (
        <div
          key={index}
          data-testid={`pie-segment-${item[nameKey]}`}
          onClick={() => onClick?.(item)}
          style={{ opacity: item.opacity || 1 }}
        >
          {item[nameKey]} - {item[dataKey]} calories
        </div>
      ))}
    </div>
  ),
  Cell: ({ fill }: { fill: string }) => <div data-testid="cell" style={{ backgroundColor: fill }} />,
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div data-testid="responsive-container">{children}</div>,
  Tooltip: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip">{children}</div>,
}));

const mockJarItems: JarItem[] = [
  {
    fruit: { id: 1, name: 'Apple', family: 'Rosaceae', order: 'Rosales', genus: 'Malus', calories: 52 },
    quantity: 2
  },
  {
    fruit: { id: 2, name: 'Banana', family: 'Musaceae', order: 'Zingiberales', genus: 'Musa', calories: 89 },
    quantity: 1
  },
  {
    fruit: { id: 1, name: 'Apple', family: 'Rosaceae', order: 'Rosales', genus: 'Malus', calories: 52 },
    quantity: 1
  }
];

describe('JarChart', () => {
  const defaultProps = {
    jarItems: mockJarItems,
    onFruitSelect: jest.fn(),
    selectedFruit: null
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders pie chart with correct data', () => {
    render(<JarChart {...defaultProps} />);
    
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  it('displays pie segments for each unique fruit', () => {
    render(<JarChart {...defaultProps} />);
    
    // Should show Apple (2+1=3 items) and Banana (1 item)
    expect(screen.getByTestId('pie-segment-Apple')).toBeInTheDocument();
    expect(screen.getByTestId('pie-segment-Banana')).toBeInTheDocument();
  });

  it('calculates total calories correctly', () => {
    render(<JarChart {...defaultProps} />);
    
    // Apple: 3 items * 52 calories = 156
    // Banana: 1 item * 89 calories = 89
    // Total: 245 calories
    const appleSegment = screen.getByTestId('pie-segment-Apple');
    const bananaSegment = screen.getByTestId('pie-segment-Banana');
    
    expect(appleSegment).toHaveTextContent('156 calories');
    expect(bananaSegment).toHaveTextContent('89 calories');
  });

  it('calls onFruitSelect when pie segment is clicked', () => {
    render(<JarChart {...defaultProps} />);
    
    const appleSegment = screen.getByTestId('pie-segment-Apple');
    fireEvent.click(appleSegment);
    
    expect(defaultProps.onFruitSelect).toHaveBeenCalledWith(1); // Apple's fruit ID
  });

  it('applies opacity styling for selected fruit', () => {
    render(<JarChart {...defaultProps} selectedFruit={1} />);
    
    const appleSegment = screen.getByTestId('pie-segment-Apple');
    const bananaSegment = screen.getByTestId('pie-segment-Banana');
    
    // Selected fruit should have full opacity, others should be dimmed
    expect(appleSegment).toHaveStyle({ opacity: 1 });
    expect(bananaSegment).toHaveStyle({ opacity: 0.5 });
  });

  it('handles empty jar items gracefully', () => {
    render(<JarChart {...defaultProps} jarItems={[]} />);
    
    expect(screen.getByTestId('pie-chart')).toBeInTheDocument();
    expect(screen.getByText('No fruits in jar')).toBeInTheDocument();
  });

  it('handles single fruit in jar', () => {
    const singleItem = [mockJarItems[0]];
    render(<JarChart {...defaultProps} jarItems={singleItem} />);
    
    expect(screen.getByTestId('pie-segment-Apple')).toBeInTheDocument();
    expect(screen.queryByTestId('pie-segment-Banana')).not.toBeInTheDocument();
  });

  it('aggregates multiple items of same fruit correctly', () => {
    render(<JarChart {...defaultProps} />);
    
    // Apple should show 3 total items (2 + 1)
    const appleSegment = screen.getByTestId('pie-segment-Apple');
    expect(appleSegment).toHaveTextContent('Apple');
    expect(appleSegment).toHaveTextContent('156 calories'); // 3 * 52
  });

  it('handles fruit selection toggle', () => {
    const { rerender } = render(<JarChart {...defaultProps} />);
    
    const appleSegment = screen.getByTestId('pie-segment-Apple');
    fireEvent.click(appleSegment);
    
    expect(defaultProps.onFruitSelect).toHaveBeenCalledWith(1);
    
    // Click again to deselect
    fireEvent.click(appleSegment);
    expect(defaultProps.onFruitSelect).toHaveBeenCalledWith(1);
  });

  it('displays tooltip on hover', () => {
    render(<JarChart {...defaultProps} />);
    
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
  });

  it('handles keyboard navigation', () => {
    render(<JarChart {...defaultProps} />);
    
    const appleSegment = screen.getByTestId('pie-segment-Apple');
    fireEvent.keyDown(appleSegment, { key: 'Enter' });
    
    expect(defaultProps.onFruitSelect).toHaveBeenCalledWith(1);
  });
}); 