import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import PeopleList from '../../src/components/PeopleList';
import api from '../../src/services/api';
import { connectToSignalR, disconnectSignalR } from '../../src/services/signalRService';
import { useAttendeeUpdates } from '../../src/hooks/useAttendeeUpdates';
import { useAttendeeMutations } from '../../src/hooks/useAttendeeMutations';

jest.mock('../../src/services/api', () => ({
  getPeopleByEvent: jest.fn()
}));

jest.mock('../../src/services/signalRService', () => ({
  connectToSignalR: jest.fn(),
  disconnectSignalR: jest.fn()
}));

jest.mock('../../src/hooks/useAttendeeUpdates', () => ({
  useAttendeeUpdates: jest.fn()
}));

jest.mock('../../src/hooks/useAttendeeMutations', () => ({
  useAttendeeMutations: jest.fn()
}));

jest.mock('../../src/components/attendees/SearchAndFilter', () => ({ searchTerm, setSearchTerm, filterOption, setFilterOption }) => (
  <div data-testid="search-and-filter">
    <input 
      data-testid="search-input" 
      value={searchTerm} 
      onChange={(e) => setSearchTerm(e.target.value)} 
    />
    <select 
      data-testid="filter-select" 
      value={filterOption} 
      onChange={(e) => setFilterOption(e.target.value)}
    >
      <option value="all">All</option>
      <option value="emptyCheckIn">Without Check-in</option>
    </select>
  </div>
));

jest.mock('../../src/components/attendees/AttendeeTable', () => ({ people, onCheckIn, onCheckOut }) => (
  <div data-testid="attendee-table">
    <div>Total people: {people.length}</div>
    <button onClick={() => onCheckIn('1')}>Check In Person</button>
    <button onClick={() => onCheckOut('1')}>Check Out Person</button>
  </div>
));

describe('PeopleList Component', () => {
  const mockPeople = [
    { id: '1', firstName: 'John', lastName: 'Doe', companyName: 'Company A', checkInDate: null, checkOutDate: null },
    { id: '2', firstName: 'Jane', lastName: 'Smith', companyName: 'Company B', checkInDate: '2023-01-01', checkOutDate: null },
  ];
  
  const mockConnection = {
    on: jest.fn(),
    off: jest.fn(),
    start: jest.fn().mockResolvedValue()
  };
  
  const mockUpdatePersonState = jest.fn();
  const mockCheckInMutation = { mutate: jest.fn() };
  const mockCheckOutMutation = { mutate: jest.fn() };
  
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
    connectToSignalR.mockReturnValue(mockConnection);
    useAttendeeUpdates.mockReturnValue({ updatePersonState: mockUpdatePersonState });
    useAttendeeMutations.mockReturnValue({
      checkInMutation: mockCheckInMutation,
      checkOutMutation: mockCheckOutMutation
    });
  });
  
  it('displays message when communityId is not provided', () => {
    render(<PeopleList />, {
      wrapper: createWrapper()
    });
    
    expect(screen.getByText('Select an event to see attendees')).toBeInTheDocument();
  });
  
  it('displays loading state when fetching data', () => {
    api.getPeopleByEvent.mockImplementation(() => new Promise(() => {}));
    
    render(<PeopleList communityId="1" />, {
      wrapper: createWrapper()
    });
    
    expect(screen.getByText('Loading attendees...')).toBeInTheDocument();
  });
  
  it('displays error message when API fails', async () => {
    api.getPeopleByEvent.mockRejectedValue(new Error('Failed to load'));
    
    render(<PeopleList communityId="1" />, {
      wrapper: createWrapper()
    });
    
    const errorMessage = await screen.findByText(/Error loading attendees/);
    expect(errorMessage).toBeInTheDocument();
  });
  
  it('renders people list correctly', async () => {
    api.getPeopleByEvent.mockResolvedValue(mockPeople);
    
    render(<PeopleList communityId="1" />, {
      wrapper: createWrapper()
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('search-and-filter')).toBeInTheDocument();
      expect(screen.getByTestId('attendee-table')).toBeInTheDocument();
      expect(screen.getByText('Total people: 2')).toBeInTheDocument();
    });
  });
  
  it('connects to SignalR when component mounts', async () => {
    api.getPeopleByEvent.mockResolvedValue(mockPeople);
    
    render(<PeopleList communityId="1" />, {
      wrapper: createWrapper()
    });
    
    await waitFor(() => {
      expect(connectToSignalR).toHaveBeenCalledWith('1');
      expect(mockConnection.on).toHaveBeenCalledWith('ReceiveEventUpdate', expect.any(Function));
    });
  });
  
  it('disconnects from SignalR when component unmounts', async () => {
    api.getPeopleByEvent.mockResolvedValue(mockPeople);
    
    const { unmount } = render(<PeopleList communityId="1" />, {
      wrapper: createWrapper()
    });
    
    unmount();
    
    expect(disconnectSignalR).toHaveBeenCalled();
  });
  
  it('filters people based on search term', async () => {
    api.getPeopleByEvent.mockResolvedValue(mockPeople);
    
    render(<PeopleList communityId="1" />, {
      wrapper: createWrapper()
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });
    
    fireEvent.change(screen.getByTestId('search-input'), { target: { value: 'John' } });
    
    expect(screen.getByTestId('search-input').value).toBe('John');
  });
  
  it('filters people based on check-in status', async () => {
    api.getPeopleByEvent.mockResolvedValue(mockPeople);
    
    render(<PeopleList communityId="1" />, {
      wrapper: createWrapper()
    });
    
    await waitFor(() => {
      expect(screen.getByTestId('filter-select')).toBeInTheDocument();
    });
    
    fireEvent.change(screen.getByTestId('filter-select'), { target: { value: 'emptyCheckIn' } });
    
    expect(screen.getByTestId('filter-select').value).toBe('emptyCheckIn');
  });
  
  it('triggers check-in mutation when check-in button is clicked', async () => {
    api.getPeopleByEvent.mockResolvedValue(mockPeople);
    
    render(<PeopleList communityId="1" />, {
      wrapper: createWrapper()
    });
    
    await waitFor(() => {
      expect(screen.getByText('Check In Person')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Check In Person'));
    
    expect(mockCheckInMutation.mutate).toHaveBeenCalledWith('1');
  });
  
  it('triggers check-out mutation when check-out button is clicked', async () => {
    api.getPeopleByEvent.mockResolvedValue(mockPeople);
    
    render(<PeopleList communityId="1" />, {
      wrapper: createWrapper()
    });
    
    await waitFor(() => {
      expect(screen.getByText('Check Out Person')).toBeInTheDocument();
    });
    
    fireEvent.click(screen.getByText('Check Out Person'));
    
    expect(mockCheckOutMutation.mutate).toHaveBeenCalledWith('1');
  });
});