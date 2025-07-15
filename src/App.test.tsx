import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Mock the components to avoid complex rendering
jest.mock('./components/layout/Layout', () => ({
  Layout: ({ children }: { children: React.ReactNode }) => <div data-testid="layout">{children}</div>
}));

jest.mock('./pages', () => ({
  HomePage: () => <div data-testid="home-page">Home Page</div>,
  FruitsPage: () => <div data-testid="fruits-page">Fruits Page</div>
}));

const renderWithRouter = (component: React.ReactElement) => render(component);

describe('App', () => {
  it('renders without crashing', () => {
    renderWithRouter(<App />);
    expect(screen.getByTestId('layout')).toBeInTheDocument();
  });

  it('renders home page by default', () => {
    renderWithRouter(<App />);
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });

  it('renders fruits page when navigating to /fruits', () => {
    window.history.pushState({}, '', '/fruits');
    renderWithRouter(<App />);
    expect(screen.getByTestId('fruits-page')).toBeInTheDocument();
  });

  it('renders home page when navigating to /', () => {
    window.history.pushState({}, '', '/');
    renderWithRouter(<App />);
    expect(screen.getByTestId('home-page')).toBeInTheDocument();
  });
});
