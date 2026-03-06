import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ProfileService } from '@/services/profileService'

export function useProfile(userId: string) {
  const queryClient = useQueryClient()

  // Controller to fetch profile data
  const profileQuery = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => ProfileService.getProfile(userId),
    enabled: !!userId,
  })

  // Controller to handle profile updates
  const updateMutation = useMutation({
    mutationFn: (updates: Parameters<typeof ProfileService.updateProfile>[1]) => 
      ProfileService.updateProfile(userId, updates),
    onSuccess: (updatedData) => {
      // Optimistically update the cache for a "snappy" mobile feel
      queryClient.setQueryData(['profile', userId], updatedData[0])
    }
  })

  return {
    profile: profileQuery.data,
    isLoading: profileQuery.isLoading,
    updateProfile: updateMutation.mutate,
    isUpdating: updateMutation.isPending
  }
}