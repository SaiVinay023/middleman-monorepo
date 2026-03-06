// Create new file: src/hooks/useGigsRealtime.ts
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export function useGigsRealtime() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'gigs',
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['gigs'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

// Then in src/hooks/useGigs.ts, remove Lines 71-87
// Import and call useGigsRealtime() only once in your app layout or dashboard
