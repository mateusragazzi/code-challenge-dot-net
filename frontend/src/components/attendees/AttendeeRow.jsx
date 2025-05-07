import React from 'react';
import { formatDate } from '../../utils/formatters';

function AttendeeRow({ person, onCheckIn, onCheckOut }) {
  const isCheckedIn = person.checkInDate && !person.checkOutDate;
  
  return (
    <tr className={isCheckedIn ? 'bg-blue-50 dark:bg-gray-900' : 'dark:bg-gray-800'}>
      <td className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 dark:text-gray-200">
        {`${person.firstName} ${person.lastName}`}
      </td>
      <td className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 dark:text-gray-200">
        {person.companyName}
      </td>
      <td className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 dark:text-gray-200">
        {person.title}
      </td>
      <td className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 dark:text-gray-200">
        {formatDate(person.checkInDate)}
      </td>
      <td className="py-3 px-4 border-b border-gray-200 dark:border-gray-700 dark:text-gray-200">
        {formatDate(person.checkOutDate)}
      </td>
      <td className="py-3 px-4 border-b border-gray-200 dark:border-gray-700">
        {!person.checkInDate && (
          <button 
            onClick={() => onCheckIn(person.id)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm transition-colors duration-200 disabled:bg-gray-400"
          >
            Check-in {person.firstName}
          </button>
        )}
        
        {person.checkInDate && !person.checkOutDate && (
          <button 
            onClick={() => onCheckOut(person.id)}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white py-1 px-3 rounded text-sm transition-colors duration-200 disabled:bg-gray-400"
          >
            Check-out {person.firstName}
          </button>
        )}
      </td>
    </tr>
  );
}

export default AttendeeRow;
