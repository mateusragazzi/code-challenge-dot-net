import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import EventCheckInApp from '../../src/components/EventCheckInApp';

jest.mock('../../src/components/EventSelector', () => ({ onSelectEvent }) => (
  <select data-testid="event-selector" onChange={(e) => onSelectEvent(e.target.value)}>
    <option value="">Select</option>
    <option value="1">Event 1</option>
  </select>
));

jest.mock('../../src/components/EventSummary', () => ({ communityId }) => (
  <div data-testid="event-summary">
    Event Summary for {communityId}
  </div>
));

jest.mock('../../src/components/PeopleList', () => ({ communityId }) => (
  <div data-testid="people-list">
    People List for {communityId}
  </div>
));

describe('EventCheckInApp Component', () => {
  it('renders EventSelector by default', () => {
    render(<EventCheckInApp />);
    expect(screen.getByTestId('event-selector')).toBeInTheDocument();
  });

  it('does not render EventSummary or PeopleList when no event is selected', () => {
    render(<EventCheckInApp />);
    expect(screen.queryByTestId('event-summary')).not.toBeInTheDocument();
    expect(screen.queryByTestId('people-list')).not.toBeInTheDocument();
  });

  it('renders EventSummary and PeopleList when an event is selected', () => {
    render(<EventCheckInApp />);
    
    fireEvent.change(screen.getByTestId('event-selector'), { target: { value: '1' } });
    
    expect(screen.getByTestId('event-summary')).toBeInTheDocument();
    expect(screen.getByTestId('people-list')).toBeInTheDocument();
    
    expect(screen.getByText('Event Summary for 1')).toBeInTheDocument();
    expect(screen.getByText('People List for 1')).toBeInTheDocument();
  });
});