import { useMutation, useQueryClient } from 'react-query';
import api from '../services/api';

export const useAttendeeMutations = (communityId, updatePersonState) => {
  const queryClient = useQueryClient();

  const checkInMutation = useMutation(
    (personId) => api.checkInPerson(personId),
    {
      onMutate: async (personId) => {
        await queryClient.cancelQueries(['people', communityId]);
        
        const previousPeople = queryClient.getQueryData(['people', communityId]);
        const previousSummary = queryClient.getQueryData(['summary', communityId]);
        
        updatePersonState(personId, 'check-in');
        
        return { previousPeople, previousSummary };
      },
      
      onError: (error, personId, context) => {
        queryClient.setQueryData(['people', communityId], context.previousPeople);
        queryClient.setQueryData(['summary', communityId], context.previousSummary);
      }
    }
  );

  const checkOutMutation = useMutation(
    (personId) => api.checkOutPerson(personId),
    {
      onMutate: async (personId) => {
        await queryClient.cancelQueries(['people', communityId]);
        
        const previousPeople = queryClient.getQueryData(['people', communityId]);
        const previousSummary = queryClient.getQueryData(['summary', communityId]);
        
        updatePersonState(personId, 'check-out');
        
        return { previousPeople, previousSummary };
      },
      
      onError: (error, personId, context) => {
        queryClient.setQueryData(['people', communityId], context.previousPeople);
        queryClient.setQueryData(['summary', communityId], context.previousSummary);
      }
    }
  );

  return { checkInMutation, checkOutMutation };
};
