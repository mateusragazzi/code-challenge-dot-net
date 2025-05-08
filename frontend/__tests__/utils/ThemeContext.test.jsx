import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { ThemeProvider, useTheme } from '../../src/utils/ThemeContext';

const TestComponent = () => {
  const { darkMode, toggleTheme } = useTheme();
  return (
    <div>
      <div data-testid="theme-value">{darkMode ? 'dark' : 'light'}</div>
      <button data-testid="toggle-button" onClick={toggleTheme}>Toggle</button>
    </div>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    jest.spyOn(Storage.prototype, 'getItem');
    jest.spyOn(Storage.prototype, 'setItem');
    
    localStorage.clear();
    
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));
    
    const classListAdd = jest.fn();
    const classListRemove = jest.fn();
    
    const originalClassList = document.documentElement.classList;
    
    Object.defineProperty(document.documentElement, 'classList', {
      value: {
        add: classListAdd,
        remove: classListRemove,
        contains: originalClassList ? originalClassList.contains : jest.fn(),
        toggle: originalClassList ? originalClassList.toggle : jest.fn(),
      },
      configurable: true
    });
  });
  
  afterEach(() => {
    jest.restoreAllMocks();
  });
  
  it('renderiza o tema padrão corretamente (claro)', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(getByTestId('theme-value').textContent).toBe('light');
  });
  
  it('alterna entre temas quando o botão é clicado', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(getByTestId('theme-value').textContent).toBe('light');
    
    fireEvent.click(getByTestId('toggle-button'));
    
    expect(getByTestId('theme-value').textContent).toBe('dark');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
    
    
    fireEvent.click(getByTestId('toggle-button'));
    
    expect(getByTestId('theme-value').textContent).toBe('light');
    expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
  });
  
  it('usa o tema salvo no localStorage se disponível', () => {
    localStorage.setItem('theme', 'dark');
    
    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(getByTestId('theme-value').textContent).toBe('dark');
  });
  
  it('usa a preferência do sistema quando não há tema salvo', () => {
    window.matchMedia = jest.fn().mockImplementation(query => ({
      matches: query === '(prefers-color-scheme: dark)' ? true : false,
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));
    
    const { getByTestId } = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(getByTestId('theme-value').textContent).toBe('dark');
  });
}); 