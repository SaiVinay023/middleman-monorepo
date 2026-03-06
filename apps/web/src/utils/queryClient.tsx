'use client';

import { 
  QueryClient, 
  QueryClientProvider, 
  QueryCache, 
  MutationCache 
} from '@tanstack/react-query';
import { useState } from 'react';
import { logDataError } from '@/lib/errorTracking';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    // 1. Move Global Query Errors here
    queryCache: new QueryCache({
      onError: (error) => {
        logDataError(error as Error, 'global_query_cache');
      },
    }),
    
    // 2. Move Global Mutation Errors here
    mutationCache: new MutationCache({
      onError: (error) => {
        logDataError(error as Error, 'global_mutation_cache');
      },
    }),

    defaultOptions: {
  queries: {
    // Data like gigs/profile is not changing every second – keep it fresh for 5 minutes
    staleTime: 5 * 60 * 1000,
    // Keep cache in memory for 10 minutes
    gcTime: 10 * 60 * 1000,
    retry: 1,
    retryDelay: (attemptIndex) =>
      Math.min(500 * 2 ** attemptIndex, 10_000),
    refetchOnWindowFocus: false,
  },
  mutations: {
    retry: 0,
  },
},

  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}