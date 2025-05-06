import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import EventCheckInApp from './components/EventCheckInApp';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      staleTime: 30000
    }
  }
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-100">
        <EventCheckInApp />
      </div>
    </QueryClientProvider>
  );
}

export default App;