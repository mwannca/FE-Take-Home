import React from 'react';
import { render, screen } from '@testing-library/react';
import LoadingSpinner from './LoadingSpinner/index';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('displays custom message', () => {
    const message = 'Loading fruits...';
    render(<LoadingSpinner message={message} />);
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  it('applies small size class', () => {
    render(<LoadingSpinner size="small" />);
    const container = screen.getByText('Loading...').closest('.loading-container');
    expect(container).toHaveClass('loading-container', 'small');
  });

  it('applies large size class', () => {
    render(<LoadingSpinner size="large" />);
    const container = screen.getByText('Loading...').closest('.loading-container');
    expect(container).toHaveClass('loading-container', 'large');
  });

  it('applies default size class when no size specified', () => {
    render(<LoadingSpinner />);
    const container = screen.getByText('Loading...').closest('.loading-container');
    expect(container).toHaveClass('loading-container');
    expect(container).not.toHaveClass('small', 'large');
  });

  it('renders spinner element', () => {
    render(<LoadingSpinner />);
    const container = screen.getByText('Loading...').closest('.loading-container');
    const spinner = container?.querySelector('.spinner');
    expect(spinner).toBeInTheDocument();
  });
}); 