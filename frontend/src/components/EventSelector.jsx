import React from 'react';
import { useQuery } from 'react-query';
import api from '../services/api';

function EventSelector({ onSelectEvent }) {
  const { data: communities, isLoading, error } = useQuery('communities', api.getCommunities);

  if (isLoading) return <div className="text-center py-4 dark:text-gray-200">Loading events...</div>;
  if (error) return <div className="text-red-500 py-4">Error loading events: {error.message}</div>;

  return (
    <div className="bg-white dark:bg-slate-950 p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-4">Event Check-In System</h2>
      <select 
        onChange={(e) => onSelectEvent(e.target.value)} 
        defaultValue=""
        className="w-full p-3 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
      >
        <option value="" disabled className="dark:bg-gray-800 dark:text-gray-200">Select an event</option>
        {communities.map(community => (
          <option key={community.id} value={community.id} className="dark:bg-gray-800 dark:text-gray-200">
            {community.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default EventSelector; 