import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import AttendeeRow from '../../../src/components/attendees/AttendeeRow';

jest.mock('../../../src/utils/formatters', () => ({
  formatDate: jest.fn(date => date ? 'formatted date' : '')
}));

describe('AttendeeRow Component', () => {
  const mockPerson = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    companyName: 'Test Company',
    title: 'Developer',
    checkInDate: null,
    checkOutDate: null
  };
  
  const onCheckIn = jest.fn();
  const onCheckOut = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('renders person data correctly', () => {
    render(
      <table>
        <tbody>
          <AttendeeRow 
            person={mockPerson} 
            onCheckIn={onCheckIn} 
            onCheckOut={onCheckOut} 
          />
        </tbody>
      </table>
    );
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Test Company')).toBeInTheDocument();
    expect(screen.getByText('Developer')).toBeInTheDocument();
  });
  
  it('displays check-in button when person has not checked in', () => {
    render(
      <table>
        <tbody>
          <AttendeeRow 
            person={mockPerson} 
            onCheckIn={onCheckIn} 
            onCheckOut={onCheckOut} 
          />
        </tbody>
      </table>
    );
    
    const button = screen.getByText(/Check-in John/i);
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(onCheckIn).toHaveBeenCalledWith('1');
  });
  
  it('displays check-out button after delay when person has checked in but not checked out', async () => {
    jest.useFakeTimers();
    
    const checkedInPerson = {
      ...mockPerson,
      checkInDate: '2023-01-01T12:00:00Z'
    };
    
    render(
      <table>
        <tbody>
          <AttendeeRow 
            person={checkedInPerson} 
            onCheckIn={onCheckIn} 
            onCheckOut={onCheckOut} 
          />
        </tbody>
      </table>
    );
    
    expect(screen.queryByText(/Check-out John/i)).not.toBeInTheDocument();
    
    act(() => {
      jest.advanceTimersByTime(5001);
    });
    
    const button = screen.getByText(/Check-out John/i);
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    expect(onCheckOut).toHaveBeenCalledWith('1');
    
    jest.useRealTimers();
  });
  
  it('applies correct styling for checked-in attendees', () => {
    const checkedInPerson = {
      ...mockPerson,
      checkInDate: '2023-01-01T12:00:00Z'
    };
    
    const { container } = render(
      <table>
        <tbody>
          <AttendeeRow 
            person={checkedInPerson} 
            onCheckIn={onCheckIn} 
            onCheckOut={onCheckOut} 
          />
        </tbody>
      </table>
    );
    
    const row = container.querySelector('tr');
    expect(row).toHaveClass('bg-blue-50');
  });
  
  it('does not show check-out button when person is already checked out', () => {
    const checkedOutPerson = {
      ...mockPerson,
      checkInDate: '2023-01-01T12:00:00Z',
      checkOutDate: '2023-01-01T14:00:00Z'
    };
    
    render(
      <table>
        <tbody>
          <AttendeeRow 
            person={checkedOutPerson} 
            onCheckIn={onCheckIn} 
            onCheckOut={onCheckOut} 
          />
        </tbody>
      </table>
    );
    
    expect(screen.queryByText(/Check-in John/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Check-out John/i)).not.toBeInTheDocument();
  });
}); 