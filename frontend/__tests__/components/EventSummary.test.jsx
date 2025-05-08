import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from 'react-query';
import EventSummary from '../../src/components/EventSummary';
import api from '../../src/services/api';
import { connectToSignalR, disconnectSignalR } from '../../src/services/signalRService';

jest.mock('../../src/services/api', () => ({
  getEventSummary: jest.fn(),
  getPeopleByEvent: jest.fn()
}));

jest.mock('../../src/services/signalRService', () => ({
  connectToSignalR: jest.fn(),
  disconnectSignalR: jest.fn()
}));

describe('EventSummary Component', () => {
  const mockSummary = {
    communityName: 'Test Event',
    totalPeople: 100,
    checkedInCount: 50,
    checkedOutCount: 20
  };
  
  const mockPeople = [
    { id: '1', firstName: 'John', lastName: 'Doe', companyName: 'Company A', checkInDate: '2023-01-01', checkOutDate: null },
    { id: '2', firstName: 'Jane', lastName: 'Smith', companyName: 'Company B', checkInDate: '2023-01-01', checkOutDate: null },
    { id: '3', firstName: 'Bob', lastName: 'Brown', companyName: 'Company A', checkInDate: '2023-01-01', checkOutDate: null },
    { id: '4', firstName: 'Alice', lastName: 'Green', companyName: null, checkInDate: '2023-01-01', checkOutDate: null }
  ];
  
  const mockConnection = {
    on: jest.fn(),
    off: jest.fn(),
    start: jest.fn().mockResolvedValue()
  };
  
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
  });
  
  it('renders nothing when communityId is not provided', () => {
    const { container } = render(<EventSummary />, {
      wrapper: createWrapper()
    });
    
    expect(container.firstChild).toBeNull();
  });
  
  it('displays loading state when fetching data', () => {
    api.getEventSummary.mockImplementation(() => new Promise(() => {}));
    api.getPeopleByEvent.mockImplementation(() => new Promise(() => {}));
    
    render(<EventSummary communityId="1" />, {
      wrapper: createWrapper()
    });
    
    expect(screen.getByText('Loading summary...')).toBeInTheDocument();
  });
  
  it('displays error message when API fails', async () => {
    api.getEventSummary.mockRejectedValue(new Error('Failed to load'));
    api.getPeopleByEvent.mockResolvedValue([]);
    
    render(<EventSummary communityId="1" />, {
      wrapper: createWrapper()
    });
    
    const errorMessage = await screen.findByText(/Error loading summary/);
    expect(errorMessage).toBeInTheDocument();
  });
  
  it('renders event summary data correctly', async () => {
    api.getEventSummary.mockResolvedValue(mockSummary);
    api.getPeopleByEvent.mockResolvedValue(mockPeople);
    
    render(<EventSummary communityId="1" />, {
      wrapper: createWrapper()
    });
    
    await waitFor(() => {
      expect(screen.getByText(/Event Summary: Test Event/)).toBeInTheDocument();
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('30')).toBeInTheDocument();
      expect(screen.getByText('20')).toBeInTheDocument();
    });
  });
  
  it('displays company breakdown correctly', async () => {
    api.getEventSummary.mockResolvedValue(mockSummary);
    api.getPeopleByEvent.mockResolvedValue(mockPeople);
    
    render(<EventSummary communityId="1" />, {
      wrapper: createWrapper()
    });
    
    await waitFor(() => {
      expect(screen.getByText('Company A')).toBeInTheDocument();
      expect(screen.getByText('Company B')).toBeInTheDocument();
      expect(screen.getByText('Not filled')).toBeInTheDocument();
    });
    
    const companyACounts = screen.getAllByText('2')[0];
    const companyBCounts = screen.getAllByText('1')[0];
    const notFilledCounts = screen.getAllByText('1')[1];
    
    expect(companyACounts).toBeInTheDocument();
    expect(companyBCounts).toBeInTheDocument();
    expect(notFilledCounts).toBeInTheDocument();
  });
  
  it('connects to SignalR when component mounts', async () => {
    api.getEventSummary.mockResolvedValue(mockSummary);
    api.getPeopleByEvent.mockResolvedValue(mockPeople);
    
    render(<EventSummary communityId="1" />, {
      wrapper: createWrapper()
    });
    
    expect(connectToSignalR).toHaveBeenCalledWith('1');
    expect(mockConnection.on).toHaveBeenCalledWith('ReceiveEventUpdate', expect.any(Function));
  });
  
  it('disconnects from SignalR when component unmounts', async () => {
    api.getEventSummary.mockResolvedValue(mockSummary);
    api.getPeopleByEvent.mockResolvedValue(mockPeople);
    
    const { unmount } = render(<EventSummary communityId="1" />, {
      wrapper: createWrapper()
    });
    
    unmount();
    
    expect(disconnectSignalR).toHaveBeenCalled();
  });
}); 