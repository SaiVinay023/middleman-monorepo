import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AdminVerifyService } from '@/services/adminVerifyService'

export function useAdminVerify() {
  const queryClient = useQueryClient()

  const pendingDocsQuery = useQuery({
    queryKey: ['admin', 'pending-docs'],
    queryFn: AdminVerifyService.getPendingDocuments
  })

  const verifyMutation = useMutation({
    mutationFn: ({ docId, userId, status }: { docId: string, userId: string, status: 'approved' | 'rejected' }) => 
      AdminVerifyService.updateDocumentStatus(docId, userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-docs'] })
      queryClient.invalidateQueries({ queryKey: ['technicians'] })
    }
  })

  return {
    pendingDocs: pendingDocsQuery.data,
    isLoading: pendingDocsQuery.isLoading,
    updateStatus: verifyMutation.mutate,
    isProcessing: verifyMutation.isPending
  }
}