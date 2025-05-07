import React, { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import api from '../services/api';
import { connectToSignalR, disconnectSignalR } from '../services/signalRService';
import { useAttendeeUpdates } from '../hooks/useAttendeeUpdates';
import { useAttendeeMutations } from '../hooks/useAttendeeMutations';
import SearchAndFilter from './attendees/SearchAndFilter';
import AttendeeTable from './attendees/AttendeeTable';

function PeopleList({ communityId }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOption, setFilterOption] = useState('all');
  
  const { data: people, isLoading, error } = useQuery(
    ['people', communityId], 
    () => api.getPeopleByEvent(communityId),
    { enabled: !!communityId }
  );

  const { updatePersonState } = useAttendeeUpdates(communityId, people);
  
  const { checkInMutation, checkOutMutation } = useAttendeeMutations(communityId, updatePersonState);

  // Manipulação direta do SignalR
  useEffect(() => {
    let connection = null;
    
    if (communityId) {
      connection = connectToSignalR(communityId);
      connection.on('ReceiveEventUpdate', (eventType, communityIdFromEvent, personId) => {
        console.log('Message received from socket', {eventType, communityIdFromEvent, personId});
        if (+communityIdFromEvent === +communityId && personId) {
          updatePersonState(personId, eventType);
        }
      });
    }
    
    // Limpar na desmontagem
    return () => {
      disconnectSignalR();
    };
  }, [communityId]);

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
    <div className="bg-white dark:bg-slate-950 p-6 rounded-lg shadow-md overflow-x-auto">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">Registered Attendees</h3>
      
      <SearchAndFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterOption={filterOption}
        setFilterOption={setFilterOption}
      />
      
      <AttendeeTable
        people={filteredPeople}
        onCheckIn={checkInMutation.mutate}
        onCheckOut={checkOutMutation.mutate}
      />
    </div>
  );
}

export default PeopleList; 