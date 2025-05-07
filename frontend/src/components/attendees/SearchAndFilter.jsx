import React from 'react';

function SearchAndFilter({ searchTerm, setSearchTerm, filterOption, setFilterOption }) {
  return (
    <div className="mb-4 flex flex-col md:flex-row gap-4">
      <div className="flex-grow">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
        />
      </div>
      <div className="md:w-64">
        <select
          value={filterOption}
          onChange={(e) => setFilterOption(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200"
        >
          <option value="all" className="dark:bg-gray-800 dark:text-gray-200">Show All Attendees</option>
          <option value="emptyCheckIn" className="dark:bg-gray-800 dark:text-gray-200">Show Only Without Check-in</option>
        </select>
      </div>
    </div>
  );
}

export default SearchAndFilter;
