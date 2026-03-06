import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AdminService } from '@/services/adminService'

export function useAdminGigs() {
  const queryClient = useQueryClient()

  // Bucket 1: All Gigs (For the master log)
  const allGigs = useQuery({
    queryKey: ['admin', 'gigs', 'all'],
    queryFn: () => AdminService.getAllGigs()
  })

  // Bucket 2: Company Submissions (Awaiting Publication)
  const pendingCompany = useQuery({
    queryKey: ['admin', 'gigs', 'pending-company'],
    queryFn: () => AdminService.getPendingCompanyGigs()
  })

  // Bucket 3: Freelancer Proofs (Awaiting Payment Release)
  const pendingReview = useQuery({
    queryKey: ['admin', 'gigs', 'pending-review'],
    queryFn: () => AdminService.getPendingWorkReviews()
  })

  // Mutation: Publish to Marketplace
  const publishMutation = useMutation({
    mutationFn: (gigId: string) => AdminService.publishGig(gigId),
    onSuccess: () => {
      // Invalidates the entire admin/gigs cache tree
      queryClient.invalidateQueries({ queryKey: ['admin', 'gigs'] })
      queryClient.invalidateQueries({ queryKey: ['gigs'] }) // Updates marketplace too
    }
  })

  // Mutation: Finalize Work & Payout
  const approveWorkMutation = useMutation({
    mutationFn: (gigId: string) => AdminService.approveWork(gigId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'gigs'] })
    }
  })

  // Mutation: Soft Delete
  const deleteMutation = useMutation({
    mutationFn: (gigId: string) => AdminService.deleteGig(gigId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'gigs'] })
    }
  })

 // A more "Bulletproof" return
return {
  gigs: allGigs.data ?? [],
  pendingCompany: pendingCompany.data ?? [],
  pendingReview: pendingReview.data ?? [],
  // Using isFetching ensures the UI knows when data is being refreshed in the background
  isLoading: allGigs.isLoading || pendingCompany.isLoading || pendingReview.isLoading,
  isFetching: allGigs.isFetching || pendingCompany.isFetching || pendingReview.isFetching,
  
  publishGig: publishMutation.mutate,
  isPublishing: publishMutation.isPending,
  approveWork: approveWorkMutation.mutate,
  isApproving: approveWorkMutation.isPending,
  deleteGig: deleteMutation.mutate
}
}