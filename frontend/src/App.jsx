import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import EventCheckInApp from './components/EventCheckInApp';
import { ThemeProvider } from './utils/ThemeContext';
import ThemeToggle from './components/ThemeToggle';

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
      <ThemeProvider>
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 dark:text-white transition-colors duration-200">
          <div className="container mx-auto px-4 py-4 flex justify-end">
            <ThemeToggle />
          </div>
          <EventCheckInApp />
        </div>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;