import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import SearchInput from './index';

describe('SearchInput', () => {
  const mockOnSearch = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with default props', () => {
    render(<SearchInput onSearch={mockOnSearch} />);
    
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search fruits...')).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(<SearchInput onSearch={mockOnSearch} placeholder="Custom placeholder" />);
    
    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
  });

  it('calls onSearch with debounced value', async () => {
    jest.useFakeTimers();
    
    render(<SearchInput onSearch={mockOnSearch} />);
    
    // Component calls onSearch with empty string on mount
    expect(mockOnSearch).toHaveBeenCalledWith('');
    
    // Clear the mock calls
    mockOnSearch.mockClear();
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'apple' } });
    
    // Should not call immediately after typing
    expect(mockOnSearch).not.toHaveBeenCalled();
    
    // Fast forward time to trigger debounce
    await act(async () => {
      jest.advanceTimersByTime(300);
    });
    
    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalledWith('apple');
    });
    
    jest.useRealTimers();
  });

  it('clears search when Escape key is pressed', () => {
    render(<SearchInput onSearch={mockOnSearch} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'apple' } });
    fireEvent.keyDown(input, { key: 'Escape' });
    
    expect(input).toHaveValue('');
    expect(mockOnSearch).toHaveBeenCalledWith('');
  });

  it('shows clear button when there is text', () => {
    render(<SearchInput onSearch={mockOnSearch} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'apple' } });
    
    expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
  });

  it('clears search when clear button is clicked', () => {
    render(<SearchInput onSearch={mockOnSearch} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'apple' } });
    
    const clearButton = screen.getByLabelText('Clear search');
    fireEvent.click(clearButton);
    
    expect(input).toHaveValue('');
    expect(mockOnSearch).toHaveBeenCalledWith('');
  });

  it('has proper accessibility attributes', () => {
    render(<SearchInput onSearch={mockOnSearch} aria-label="Custom search" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-label', 'Custom search');
    expect(input).toHaveAttribute('aria-describedby', 'search-description');
  });

  it('applies custom className', () => {
    render(<SearchInput onSearch={mockOnSearch} className="custom-class" />);
    
    const container = screen.getByRole('textbox').closest('div');
    expect(container).toHaveClass('custom-class');
  });
}); 