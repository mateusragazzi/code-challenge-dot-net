import React from 'react';
import { useQuery } from 'react-query';
import api from '../services/api';

function EventSelector({ onSelectEvent }) {
  const { data: communities, isLoading, error } = useQuery('communities', api.getCommunities);

  if (isLoading) return <div className="text-center py-4">Loading events...</div>;
  if (error) return <div className="text-red-500 py-4">Error loading events: {error.message}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Event Check-In System</h2>
      <select 
        onChange={(e) => onSelectEvent(e.target.value)} 
        defaultValue=""
        className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="" disabled>Select an event</option>
        {communities.map(community => (
          <option key={community.id} value={community.id}>
            {community.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default EventSelector; 