import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../src/App';
import { QueryClient, QueryClientProvider } from 'react-query';

jest.mock('../src/components/EventCheckInApp', () => () => <div data-testid="event-check-in-app" />);
jest.mock('../src/components/ThemeToggle', () => () => <div data-testid="theme-toggle" />);
jest.mock('../src/utils/ThemeContext', () => ({
  ThemeProvider: ({ children }) => <div data-testid="theme-provider">{children}</div>
}));

jest.mock('react-query', () => {
  const originalModule = jest.requireActual('react-query');
  return {
    ...originalModule,
    QueryClientProvider: ({ children }) => <div data-testid="query-client-provider">{children}</div>,
    QueryClient: jest.fn()
  };
});

describe('App Component', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
  });

  it('renders ThemeToggle component', () => {
    render(<App />);
    expect(screen.getByTestId('theme-toggle')).toBeInTheDocument();
  });

  it('renders EventCheckInApp component', () => {
    render(<App />);
    expect(screen.getByTestId('event-check-in-app')).toBeInTheDocument();
  });

  it('provides QueryClientProvider to the application', () => {
    render(<App />);
    expect(screen.getByTestId('query-client-provider')).toBeInTheDocument();
    expect(QueryClient).toHaveBeenCalled();
  });
}); 