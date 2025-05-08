import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ThemeToggle from '../../src/components/ThemeToggle';
import { useTheme } from '../../src/utils/ThemeContext';

jest.mock('../../src/utils/ThemeContext', () => ({
  useTheme: jest.fn()
}));

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders sun icon when in dark mode', () => {
    useTheme.mockReturnValue({
      darkMode: true,
      toggleTheme: jest.fn()
    });
    
    render(<ThemeToggle />);
    
    const button = screen.getByRole('button', { name: 'Mudar para modo claro' });
    expect(button).toBeInTheDocument();
    
    const svgPath = document.querySelector('path[d^="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364"]');
    expect(svgPath).toBeInTheDocument();
  });
  
  it('renders moon icon when in light mode', () => {
    useTheme.mockReturnValue({
      darkMode: false,
      toggleTheme: jest.fn()
    });
    
    render(<ThemeToggle />);
    
    const button = screen.getByRole('button', { name: 'Mudar para modo escuro' });
    expect(button).toBeInTheDocument();
    
    const svgPath = document.querySelector('path[d^="M20.354 15.354A9 9 0 018.646 3.646"]');
    expect(svgPath).toBeInTheDocument();
  });
  
  it('calls toggleTheme when clicked', () => {
    const mockToggleTheme = jest.fn();
    
    useTheme.mockReturnValue({
      darkMode: false,
      toggleTheme: mockToggleTheme
    });
    
    render(<ThemeToggle />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });
  
  it('applies correct styles based on theme', () => {
    useTheme.mockReturnValue({
      darkMode: true,
      toggleTheme: jest.fn()
    });
    
    const { rerender } = render(<ThemeToggle />);
    
    let button = screen.getByRole('button');
    expect(button).toHaveClass('dark:bg-gray-700');
    expect(button).toHaveClass('dark:text-gray-200');
    
    useTheme.mockReturnValue({
      darkMode: false,
      toggleTheme: jest.fn()
    });
    
    rerender(<ThemeToggle />);
    
    button = screen.getByRole('button');
    expect(button).toHaveClass('bg-gray-200');
    expect(button).toHaveClass('text-gray-800');
  });
}); 