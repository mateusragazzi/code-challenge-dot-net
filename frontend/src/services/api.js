import axios from 'axios';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5203/api/Event';

const api = {
  getCommunities: async () => {
    const response = await axios.get(`${BASE_URL}/communities`);
    return response.data;
  },
  getPeopleByEvent: async (communityId) => {
    const response = await axios.get(`${BASE_URL}/people/${communityId}`);
    return response.data;
  },
  getEventSummary: async (communityId) => {
    const response = await axios.get(`${BASE_URL}/summary/${communityId}`);
    return response.data;
  },
  checkInPerson: async (personId) => {
    const response = await axios.post(`${BASE_URL}/check-in/${personId}`);
    return response.data;
  },
  checkOutPerson: async (personId) => {
    const response = await axios.post(`${BASE_URL}/check-out/${personId}`);
    return response.data;
  }
};

export default api; 