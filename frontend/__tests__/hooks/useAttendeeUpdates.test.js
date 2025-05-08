import React, { act } from 'react';
import { renderHook } from '@testing-library/react';
import { useAttendeeUpdates } from '../../src/hooks/useAttendeeUpdates';
import { useQueryClient } from 'react-query';

jest.mock('react-query', () => ({
  useQueryClient: jest.fn()
}));

describe('useAttendeeUpdates Hook', () => {
  const mockSetQueryData = jest.fn();
  const mockInvalidateQueries = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    useQueryClient.mockReturnValue({
      setQueryData: mockSetQueryData,
      invalidateQueries: mockInvalidateQueries
    });
  });

  it('should update person state when checked in', () => {
    const communityId = '123';
    const mockPeople = [
      { id: '1', name: 'Person 1', checkInDate: null, checkOutDate: null }
    ];
    
    mockSetQueryData.mockImplementation((key, callback) => {
      return callback(mockPeople);
    });
    
    const { result } = renderHook(() => useAttendeeUpdates(communityId, mockPeople));
    
    act(() => {
      result.current.updatePersonState('1', 'check-in');
    });
    
    expect(mockSetQueryData).toHaveBeenCalledWith(['people', communityId], expect.any(Function));
    
    const updatedPeople = mockSetQueryData.mock.calls[0][1](mockPeople);
    
    expect(updatedPeople[0].checkInDate).toBeTruthy();
    expect(updatedPeople[0].checkOutDate).toBeNull();
  });

  it('should update person state when checked out', () => {
    const communityId = '123';
    const mockPeople = [
      { 
        id: '1', 
        name: 'Person 1', 
        checkInDate: '2023-01-01T10:00:00Z', 
        checkOutDate: null 
      }
    ];
    
    mockSetQueryData.mockImplementation((key, callback) => {
      return callback(mockPeople);
    });
    
    const { result } = renderHook(() => useAttendeeUpdates(communityId, mockPeople));
    
    act(() => {
      result.current.updatePersonState('1', 'check-out');
    });
    
    expect(mockSetQueryData).toHaveBeenCalledWith(['people', communityId], expect.any(Function));
    
    const updatedPeople = mockSetQueryData.mock.calls[0][1](mockPeople);
    
    expect(updatedPeople[0].checkInDate).toBe('2023-01-01T10:00:00Z');
    expect(updatedPeople[0].checkOutDate).toBeTruthy();
  });

  it('should do nothing when person id does not match', () => {
    const communityId = '123';
    const mockPeople = [
      { id: '1', name: 'Person 1', checkInDate: null, checkOutDate: null }
    ];
    
    mockSetQueryData.mockImplementation((key, callback) => {
      return callback(mockPeople);
    });
    
    const { result } = renderHook(() => useAttendeeUpdates(communityId, mockPeople));
    
    act(() => {
      result.current.updatePersonState('999', 'check-in');
    });
    
    const updatedPeople = mockSetQueryData.mock.calls[0][1](mockPeople);
    
    expect(updatedPeople[0].checkInDate).toBeNull();
    expect(updatedPeople[0].checkOutDate).toBeNull();
  });

  it('should invalidate queries', () => {
    const communityId = '123';
    
    const { result } = renderHook(() => useAttendeeUpdates(communityId, []));
    
    act(() => {
      result.current.invalidateQueries();
    });
    
    expect(mockInvalidateQueries).toHaveBeenCalledWith(['people', communityId]);
    expect(mockInvalidateQueries).toHaveBeenCalledWith(['summary', communityId]);
  });
});
