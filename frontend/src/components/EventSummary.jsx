import React from 'react';
import { useQuery } from 'react-query';
import api from '../services/api';

function EventSummary({ communityId }) {
  const { data: summary, isLoading, error } = useQuery(
    ['summary', communityId], 
    () => api.getEventSummary(communityId),
    { 
      enabled: !!communityId,
      refetchInterval: 10000
    }
  );

  const { data: people } = useQuery(
    ['people', communityId], 
    () => api.getPeopleByEvent(communityId),
    { enabled: !!communityId }
  );

  if (!communityId) return null;
  if (isLoading) return <div className="text-center py-4">Loading summary...</div>;
  if (error) return <div className="text-red-500 py-4">Error loading summary: {error.message}</div>;

  const companyBreakdown = people
    ? people
        .filter(p => p.checkInDate && !p.checkOutDate)
        .reduce((acc, person) => {
          const company = person.companyName || 'Not filled';
          acc[company] = (acc[company] || 0) + 1;
          return acc;
        }, {})
    : {};

  return (
    <div className="bg-white dark:bg-slate-950 p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 dark:text-gray-200 mb-4">Event Summary: {summary.communityName}</h3>
      
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md text-center">
          <h4 className="text-gray-800 dark:text-gray-200 text-sm font-medium mb-2">Current Attendees</h4>
          <p className="text-2xl font-bold text-blue-500">{summary.checkedInCount}</p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md text-center">
          <h4 className="text-gray-800 dark:text-gray-200 text-sm font-medium mb-2">Not Checked In</h4>
          <p className="text-2xl font-bold text-blue-500">{summary.totalPeople - summary.checkedInCount - summary.checkedOutCount}</p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-900 p-4 rounded-md text-center">
          <h4 className="text-gray-800 dark:text-gray-200 text-sm font-medium mb-2">Total Registered</h4>
          <p className="text-2xl font-bold text-blue-500">{summary.totalPeople}</p>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-gray-800 dark:text-gray-200 text-base font-medium mb-3">Company Breakdown</h4>
        <ul className="divide-y divide-gray-200">
          {Object.entries(companyBreakdown).map(([company, count]) => {
            return (
              <li key={company} className="py-2 flex justify-between">
                <span className="font-medium">{company}</span>
                <span className="font-bold text-blue-500">{count}</span>
              </li>
            );
          })}
          {Object.keys(companyBreakdown).length === 0 && (
            <li className="py-2 text-gray-800 dark:text-gray-200 italic">No current attendees</li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default EventSummary; 