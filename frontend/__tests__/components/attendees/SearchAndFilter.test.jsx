import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchAndFilter from '../../../src/components/attendees/SearchAndFilter';

describe('SearchAndFilter Component', () => {
  const mockProps = {
    searchTerm: '',
    setSearchTerm: jest.fn(),
    filterOption: 'all',
    setFilterOption: jest.fn()
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders search input and filter dropdown', () => {
    render(<SearchAndFilter {...mockProps} />);
    
    expect(screen.getByPlaceholderText('Search by name...')).toBeInTheDocument();
    expect(screen.getByText('Show All Attendees')).toBeInTheDocument();
  });
  
  it('handles search input changes', () => {
    render(<SearchAndFilter {...mockProps} />);
    
    const searchInput = screen.getByPlaceholderText('Search by name...');
    fireEvent.change(searchInput, { target: { value: 'John' } });
    
    expect(mockProps.setSearchTerm).toHaveBeenCalledWith('John');
  });
  
  it('handles filter changes', () => {
    render(<SearchAndFilter {...mockProps} />);
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'emptyCheckIn' } });
    
    expect(mockProps.setFilterOption).toHaveBeenCalledWith('emptyCheckIn');
  });
  
  it('displays the search term value from props', () => {
    render(<SearchAndFilter {...mockProps} searchTerm="Test" />);
    
    const searchInput = screen.getByPlaceholderText('Search by name...');
    expect(searchInput.value).toBe('Test');
  });
  
  it('selects the correct filter option from props', () => {
    render(<SearchAndFilter {...mockProps} filterOption="emptyCheckIn" />);
    
    const select = screen.getByRole('combobox');
    expect(select.value).toBe('emptyCheckIn');
  });
}); 