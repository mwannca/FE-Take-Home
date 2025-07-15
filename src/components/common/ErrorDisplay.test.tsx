import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ErrorDisplay from './ErrorDisplay/index';

describe('ErrorDisplay', () => {
  const mockError = 'Failed to fetch fruits';
  const mockOnRetry = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders error message', () => {
    render(<ErrorDisplay error={mockError} onRetry={mockOnRetry} />);
    expect(screen.getByText(mockError)).toBeInTheDocument();
  });

  it('displays error icon', () => {
    render(<ErrorDisplay error={mockError} onRetry={mockOnRetry} />);
    expect(screen.getByText('⚠️')).toBeInTheDocument();
  });

  it('displays retry button', () => {
    render(<ErrorDisplay error={mockError} onRetry={mockOnRetry} />);
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('calls onRetry when retry button is clicked', () => {
    render(<ErrorDisplay error={mockError} onRetry={mockOnRetry} />);
    const retryButton = screen.getByRole('button', { name: /try again/i });
    fireEvent.click(retryButton);
    expect(mockOnRetry).toHaveBeenCalledTimes(1);
  });

  it('displays helpful message', () => {
    render(<ErrorDisplay error={mockError} onRetry={mockOnRetry} />);
    expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
  });

  it('handles different error messages', () => {
    const differentError = 'Network connection failed';
    render(<ErrorDisplay error={differentError} onRetry={mockOnRetry} />);
    expect(screen.getByText(differentError)).toBeInTheDocument();
  });

  it('renders without onRetry prop', () => {
    render(<ErrorDisplay error={mockError} />);
    expect(screen.getByText(mockError)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('displays error title', () => {
    render(<ErrorDisplay error={mockError} onRetry={mockOnRetry} />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
}); 