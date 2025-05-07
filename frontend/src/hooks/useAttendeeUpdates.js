import { useQueryClient } from 'react-query';

export const useAttendeeUpdates = (communityId, people) => {
  const queryClient = useQueryClient();

  const updatePersonState = (personId, eventType) => {
    queryClient.setQueryData(['people', communityId], oldPeople => {
      if (!oldPeople) return oldPeople;
      
      return oldPeople.map(person => {
        if (person.id === personId) {
          if (eventType === 'check-in') {
            return {
              ...person,
              checkInDate: new Date().toISOString(),
              checkOutDate: null
            };
          } else if (eventType === 'check-out') {
            return {
              ...person,
              checkOutDate: new Date().toISOString()
            };
          }
        }
        return person;
      });
    });
  };

  const invalidateQueries = () => {
    queryClient.invalidateQueries(['people', communityId]);
    queryClient.invalidateQueries(['summary', communityId]);
  };

  return { updatePersonState, invalidateQueries };
};
