import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { GigService } from '@/services/gigService'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useGigs(userId?: string, filters?: { query?: string }) {
  const queryClient = useQueryClient()

  // Controller: Available Gigs Feed
  const availableGigs = useQuery({
    queryKey: ['gigs', 'available', filters?.query],
    queryFn: () => GigService.getAvailableGigs(filters)
  })

  // Controller: My Assigned Gigs
  const myGigs = useQuery({
    queryKey: ['gigs', 'mine', userId],
    queryFn: () => GigService.getMyGigs(userId!),
    enabled: !!userId
  })

  // Controller: Accept Job Action
  const claimMutation = useMutation({
    mutationFn: ({ gigId, techId }: { gigId: string, techId: string }) => 
      GigService.claimGig(gigId, techId),
    onSuccess: (_data, variables) => {
  queryClient.invalidateQueries({ queryKey: ['gigs', 'available'] });
  if (variables.techId) {
    queryClient.invalidateQueries({
      queryKey: ['gigs', 'mine', variables.techId],
    });
  }
},
  })

  // Inside your useGigs hook, add this mutation
const updateStatusMutation = useMutation({
  // 1. Update the mutationFn to accept userId
  mutationFn: ({ gigId, status, userId }: { gigId: string, status: any, userId: string }) => 
    GigService.updateGigStatus(gigId, status, userId), // ✅ Now passing all 3 arguments
  onSuccess: (_data, variables) => {
  queryClient.invalidateQueries({ queryKey: ['gigs', 'mine', variables.userId] });
  queryClient.invalidateQueries({ queryKey: ['gigs', 'available'] });
},
})

const completeMutation = useMutation({
  // 1. ADD 'userId' to the object type here
  mutationFn: ({ gigId, cloudinaryUrl, userId }: { gigId: string, cloudinaryUrl: string, userId: string }) => 
    GigService.submitCompletion(gigId, cloudinaryUrl, userId), // 2. Pass it to the service
  onSuccess: (_data, variables) => {
  queryClient.invalidateQueries({ queryKey: ['gigs', 'mine', variables.userId] });
  queryClient.invalidateQueries({ queryKey: ['gigs', 'available'] });
},
});
useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE', // Listen for Inserts, Updates, and Deletes
          schema: 'public',
          table: 'gigs',
        },
        (_payload) => {
          // Whenever a gig changes in the DB, tell React Query to refresh the data
          queryClient.invalidateQueries({ queryKey: ['gigs'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    available: {
      data: availableGigs.data,
      isLoading: availableGigs.isLoading
    },
    mine: {
      data: myGigs.data,
      isLoading: myGigs.isLoading
    },
    claimGig: claimMutation.mutate,
    isClaiming: claimMutation.isPending,
    updateStatus: updateStatusMutation.mutate,
    isUpdatingStatus: updateStatusMutation.isPending,
    completeGig: completeMutation.mutate,
    isCompleting: completeMutation.isPending
  }
}