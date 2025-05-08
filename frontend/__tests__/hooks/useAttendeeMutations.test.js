import React, { act } from 'react';
import { renderHook } from '@testing-library/react';
import { useMutation, useQueryClient } from 'react-query';
import { useAttendeeMutations } from '../../src/hooks/useAttendeeMutations';
import api from '../../src/services/api';

jest.mock('react-query', () => ({
  useMutation: jest.fn(),
  useQueryClient: jest.fn()
}));

jest.mock('../../src/services/api', () => ({
  checkInPerson: jest.fn(),
  checkOutPerson: jest.fn()
}));

describe('useAttendeeMutations Hook', () => {
  const mockCancelQueries = jest.fn().mockResolvedValue();
  const mockGetQueryData = jest.fn();
  const mockSetQueryData = jest.fn();
  
  const mockUpdatePersonState = jest.fn();
  const communityId = '123';
  const personId = '1';
  const mockPreviousPeople = [{ id: personId }];
  const mockPreviousSummary = { total: 10, present: 5 };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    mockGetQueryData.mockImplementation((key) => {
      if (key[0] === 'people' && key[1] === communityId) return mockPreviousPeople;
      if (key[0] === 'summary' && key[1] === communityId) return mockPreviousSummary;
      return null;
    });
    
    useQueryClient.mockReturnValue({
      cancelQueries: mockCancelQueries,
      getQueryData: mockGetQueryData,
      setQueryData: mockSetQueryData
    });
    
    useMutation.mockImplementation((mutationFn, options) => {
      return {
        mutate: async (id) => {
          const context = options.onMutate(id);
          
          try {
            const result = await mutationFn(id);
            return result;
          } catch (error) {
            options.onError(error, id, context);
            throw error;
          }
        },
        mutateAsync: jest.fn(),
        isLoading: false
      };
    });
    
    api.checkInPerson.mockResolvedValue({ success: true });
    api.checkOutPerson.mockResolvedValue({ success: true });
  });

  it('should call updatePersonState on check-in mutation', async () => {
    const { result } = renderHook(() => 
      useAttendeeMutations(communityId, mockUpdatePersonState)
    );
    
    await act(async () => {
      await result.current.checkInMutation.mutate(personId);
    });
    
    expect(mockCancelQueries).toHaveBeenCalledWith(['people', communityId]);
    expect(mockUpdatePersonState).toHaveBeenCalledWith(personId, 'check-in');
    expect(api.checkInPerson).toHaveBeenCalledWith(personId);
  });

  it('should call updatePersonState on check-out mutation', async () => {
    const { result } = renderHook(() => 
      useAttendeeMutations(communityId, mockUpdatePersonState)
    );
    
    await act(async () => {
      await result.current.checkOutMutation.mutate(personId);
    });
    
    expect(mockCancelQueries).toHaveBeenCalledWith(['people', communityId]);
    expect(mockUpdatePersonState).toHaveBeenCalledWith(personId, 'check-out');
    expect(api.checkOutPerson).toHaveBeenCalledWith(personId);
  });

});