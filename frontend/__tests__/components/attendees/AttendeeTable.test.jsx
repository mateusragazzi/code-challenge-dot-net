import React from 'react';
import { render, screen } from '@testing-library/react';
import AttendeeTable from '../../../src/components/attendees/AttendeeTable';

jest.mock('../../../src/components/attendees/AttendeeRow', () => ({ person, onCheckIn, onCheckOut }) => (
  <tr data-testid={`attendee-row-${person.id}`}>
    <td>Mock Attendee Row for {person.firstName}</td>
  </tr>
));

describe('AttendeeTable Component', () => {
  const mockPeople = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      companyName: 'Company A',
      title: 'Developer',
      checkInDate: null,
      checkOutDate: null
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      companyName: 'Company B',
      title: 'Designer',
      checkInDate: '2023-01-01T12:00:00Z',
      checkOutDate: null
    }
  ];
  
  const onCheckIn = jest.fn();
  const onCheckOut = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('displays a message when no attendees are found', () => {
    render(<AttendeeTable people={[]} onCheckIn={onCheckIn} onCheckOut={onCheckOut} />);
    
    expect(screen.getByText('No attendees found matching the current filters')).toBeInTheDocument();
  });
  
  it('displays a message when attendees list is null', () => {
    render(<AttendeeTable people={null} onCheckIn={onCheckIn} onCheckOut={onCheckOut} />);
    
    expect(screen.getByText('No attendees found matching the current filters')).toBeInTheDocument();
  });
  
  it('renders table headers when people are provided', () => {
    render(<AttendeeTable people={mockPeople} onCheckIn={onCheckIn} onCheckOut={onCheckOut} />);
    
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Check-in')).toBeInTheDocument();
    expect(screen.getByText('Check-out')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });
  
  it('renders an AttendeeRow for each person', () => {
    render(<AttendeeTable people={mockPeople} onCheckIn={onCheckIn} onCheckOut={onCheckOut} />);
    
    expect(screen.getByTestId('attendee-row-1')).toBeInTheDocument();
    expect(screen.getByTestId('attendee-row-2')).toBeInTheDocument();
    expect(screen.getAllByText(/Mock Attendee Row for/)).toHaveLength(2);
  });
  
  it('passes down correct props to AttendeeRow', () => {
    render(<AttendeeTable people={mockPeople} onCheckIn={onCheckIn} onCheckOut={onCheckOut} />);
    
    expect(screen.getByText('Mock Attendee Row for John')).toBeInTheDocument();
    expect(screen.getByText('Mock Attendee Row for Jane')).toBeInTheDocument();
  });
}); 