import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import EventSelector from '../../src/components/EventSelector';
import api from '../../src/services/api';

jest.mock('../../src/services/api', () => ({
  getCommunities: jest.fn()
}));

describe('EventSelector Component', () => {
  const mockCommunities = [
    { id: '1', name: 'Event 1' },
    { id: '2', name: 'Event 2' }
  ];
  
  const onSelectEvent = jest.fn();
  
  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    
    return ({ children }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('displays loading state when fetching data', () => {
    api.getCommunities.mockImplementation(() => new Promise(() => {}));
    
    render(<EventSelector onSelectEvent={onSelectEvent} />, {
      wrapper: createWrapper()
    });
    
    expect(screen.getByText('Loading events...')).toBeInTheDocument();
  });
  
  it('displays error message when API fails', async () => {
    api.getCommunities.mockRejectedValue(new Error('Failed to load'));
    
    render(<EventSelector onSelectEvent={onSelectEvent} />, {
      wrapper: createWrapper()
    });
    
    const errorMessage = await screen.findByText(/Error loading events/);
    expect(errorMessage).toBeInTheDocument();
  });
  
  it('renders event options when data is loaded', async () => {
    api.getCommunities.mockResolvedValue(mockCommunities);
    
    render(<EventSelector onSelectEvent={onSelectEvent} />, {
      wrapper: createWrapper()
    });
    
    const event1Option = await screen.findByText('Event 1');
    const event2Option = await screen.findByText('Event 2');
    
    expect(event1Option).toBeInTheDocument();
    expect(event2Option).toBeInTheDocument();
  });
  
  it('calls onSelectEvent when an event is selected', async () => {
    api.getCommunities.mockResolvedValue(mockCommunities);
    
    render(<EventSelector onSelectEvent={onSelectEvent} />, {
      wrapper: createWrapper()
    });
    
    await screen.findByText('Event 1');
    
    const selectElement = screen.getByRole('combobox');
    fireEvent.change(selectElement, { target: { value: '2' } });
    
    expect(onSelectEvent).toHaveBeenCalledWith('2');
  });
}); 