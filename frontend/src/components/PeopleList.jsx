import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../services/api';
import { formatDate } from '../utils/formatters';

function PeopleList({ communityId }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOption, setFilterOption] = useState('all'); // 'all' ou 'emptyCheckIn'
  const queryClient = useQueryClient();
  const { data: people, isLoading, error } = useQuery(
    ['people', communityId], 
    () => api.getPeopleByEvent(communityId),
    { enabled: !!communityId, refetchInterval: 10000 }
  );

  const checkInMutation = useMutation(
    (personId) => api.checkInPerson(personId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['people', communityId]);
        queryClient.invalidateQueries(['summary', communityId]);
      }
    }
  );

  const checkOutMutation = useMutation(
    (personId) => api.checkOutPerson(personId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['people', communityId]);
        queryClient.invalidateQueries(['summary', communityId]);
      }
    }
  );

  if (!communityId) return <div className="text-center py-4 text-gray-600">Select an event to see attendees</div>;
  if (isLoading) return <div className="text-center py-4">Loading attendees...</div>;
  if (error) return <div className="text-red-500 py-4">Error loading attendees: {error.message}</div>;

  const filteredPeople = people.filter(person => {
    const fullName = `${person.firstName} ${person.lastName}`.toLowerCase();
    const nameMatch = fullName.includes(searchTerm.toLowerCase());
    const checkInMatch = filterOption === 'all' || (filterOption === 'emptyCheckIn' && !person.checkInDate);
    
    return nameMatch && checkInMatch;
  });

  return (
    <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
      <h3 className="text-xl font-semibold text-gray-700 mb-4">Registered Attendees</h3>
      
      <div className="mb-4 flex flex-col md:flex-row gap-4">
        <div className="flex-grow">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="md:w-64">
          <select
            value={filterOption}
            onChange={(e) => setFilterOption(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Show All Attendees</option>
            <option value="emptyCheckIn">Show Only Without Check-in</option>
          </select>
        </div>
      </div>
      
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50">
            <th className="py-3 px-4 text-left font-medium text-gray-700 border-b-2 border-gray-200">Name</th>
            <th className="py-3 px-4 text-left font-medium text-gray-700 border-b-2 border-gray-200">Company</th>
            <th className="py-3 px-4 text-left font-medium text-gray-700 border-b-2 border-gray-200">Title</th>
            <th className="py-3 px-4 text-left font-medium text-gray-700 border-b-2 border-gray-200">Check-in Time</th>
            <th className="py-3 px-4 text-left font-medium text-gray-700 border-b-2 border-gray-200">Check-out Time</th>
            <th className="py-3 px-4 text-left font-medium text-gray-700 border-b-2 border-gray-200">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredPeople.length > 0 ? (
            filteredPeople.map(person => (
              <tr key={person.id} className={person.checkInDate && !person.checkOutDate ? 'bg-blue-50' : ''}>
                <td className="py-3 px-4 border-b border-gray-200">{`${person.firstName} ${person.lastName}`}</td>
                <td className="py-3 px-4 border-b border-gray-200">{person.companyName}</td>
                <td className="py-3 px-4 border-b border-gray-200">{person.title}</td>
                <td className="py-3 px-4 border-b border-gray-200">{formatDate(person.checkInDate)}</td>
                <td className="py-3 px-4 border-b border-gray-200">{formatDate(person.checkOutDate)}</td>
                <td className="py-3 px-4 border-b border-gray-200">
                  {!person.checkInDate && (
                    <button 
                      onClick={() => checkInMutation.mutate(person.id)}
                      disabled={checkInMutation.isLoading}
                      className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm transition-colors duration-200 disabled:bg-gray-400"
                    >
                      Check-in {person.firstName}
                    </button>
                  )}
                  
                  {person.checkInDate && !person.checkOutDate && (
                    <button 
                      onClick={() => checkOutMutation.mutate(person.id)}
                      disabled={checkOutMutation.isLoading}
                      className="bg-orange-500 hover:bg-orange-600 text-white py-1 px-3 rounded text-sm transition-colors duration-200 disabled:bg-gray-400"
                    >
                      Check-out {person.firstName}
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="py-4 text-center text-gray-500">
                {searchTerm ? `No attendees found matching "${searchTerm}"` : 'No attendees match the current filters'}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default PeopleList; 