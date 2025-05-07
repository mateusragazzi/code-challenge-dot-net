import React from 'react';
import AttendeeRow from './AttendeeRow';

function AttendeeTable({ people, onCheckIn, onCheckOut }) {
  if (!people || people.length === 0) {
    return (
      <div className="py-4 text-center text-gray-500 dark:text-gray-400">
        No attendees found matching the current filters
      </div>
    );
  }

  return (
    <table className="w-full">
      <thead>
        <tr className="bg-gray-100 dark:bg-gray-900">
          <th className="py-3 px-4 text-left font-medium text-gray-800 dark:text-gray-200 border-b-2 border-gray-200 dark:border-gray-700">Name</th>
          <th className="py-3 px-4 text-left font-medium text-gray-800 dark:text-gray-200 border-b-2 border-gray-200 dark:border-gray-700">Company</th>
          <th className="py-3 px-4 text-left font-medium text-gray-800 dark:text-gray-200 border-b-2 border-gray-200 dark:border-gray-700">Title</th>
          <th className="py-3 px-4 text-left font-medium text-gray-800 dark:text-gray-200 border-b-2 border-gray-200 dark:border-gray-700">Check-in</th>
          <th className="py-3 px-4 text-left font-medium text-gray-800 dark:text-gray-200 border-b-2 border-gray-200 dark:border-gray-700">Check-out</th>
          <th className="py-3 px-4 text-left font-medium text-gray-800 dark:text-gray-200 border-b-2 border-gray-200 dark:border-gray-700">Actions</th>
        </tr>
      </thead>
      <tbody>
        {people.map(person => (
          <AttendeeRow 
            key={person.id} 
            person={person} 
            onCheckIn={onCheckIn} 
            onCheckOut={onCheckOut} 
          />
        ))}
      </tbody>
    </table>
  );
}

export default AttendeeTable;
