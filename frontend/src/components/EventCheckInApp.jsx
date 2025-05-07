import React, { useState } from 'react';
import EventSelector from './EventSelector';
import EventSummary from './EventSummary';
import PeopleList from './PeopleList';

function EventCheckInApp() {
  const [selectedCommunityId, setSelectedCommunityId] = useState('');

  const handleSelectEvent = (communityId) => {
    setSelectedCommunityId(communityId);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <EventSelector onSelectEvent={handleSelectEvent} />
      
      {selectedCommunityId && (
        <div className="grid grid-cols-1 lg:grid-cols-3 lg:gap-6">
          <div className="lg:col-span-1 md:col-span-1">
            <EventSummary communityId={selectedCommunityId} />
          </div>
          <div className="lg:col-span-2 md:col-span-1">
            <PeopleList communityId={selectedCommunityId} />
          </div>
        </div>
      )}
    </div>
  );
}

export default EventCheckInApp; 