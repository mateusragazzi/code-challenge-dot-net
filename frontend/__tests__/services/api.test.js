import axios from 'axios';
import api from '../../src/services/api';

jest.mock('axios');

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getCommunities should fetch communities', async () => {
    const mockData = [{ id: '1', name: 'Community 1' }];
    axios.get.mockResolvedValueOnce({ data: mockData });

    const result = await api.getCommunities();
    
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/communities'));
    expect(result).toEqual(mockData);
  });

  it('getPeopleByEvent should fetch people for a specific community', async () => {
    const communityId = '123';
    const mockData = [{ id: '1', name: 'Person 1' }];
    axios.get.mockResolvedValueOnce({ data: mockData });

    const result = await api.getPeopleByEvent(communityId);
    
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining(`/people/${communityId}`));
    expect(result).toEqual(mockData);
  });

  it('getEventSummary should fetch summary for a specific community', async () => {
    const communityId = '123';
    const mockData = { total: 10, present: 5 };
    axios.get.mockResolvedValueOnce({ data: mockData });

    const result = await api.getEventSummary(communityId);
    
    expect(axios.get).toHaveBeenCalledWith(expect.stringContaining(`/summary/${communityId}`));
    expect(result).toEqual(mockData);
  });

  it('checkInPerson should make a check-in request', async () => {
    const personId = '123';
    const mockData = { success: true };
    axios.post.mockResolvedValueOnce({ data: mockData });

    const result = await api.checkInPerson(personId);
    
    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining(`/check-in/${personId}`));
    expect(result).toEqual(mockData);
  });

  it('checkOutPerson should make a check-out request', async () => {
    const personId = '123';
    const mockData = { success: true };
    axios.post.mockResolvedValueOnce({ data: mockData });

    const result = await api.checkOutPerson(personId);
    
    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining(`/check-out/${personId}`));
    expect(result).toEqual(mockData);
  });

  it('should handle API errors', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network error'));

    await expect(api.getCommunities()).rejects.toThrow('Network error');
  });
}); 