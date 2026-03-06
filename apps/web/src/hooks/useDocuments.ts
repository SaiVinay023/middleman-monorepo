import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { DocService } from '@/services/docService'

export function useDocuments(userId: string) {
  const queryClient = useQueryClient()

  // Controller to fetch status of documents
  const docsQuery = useQuery({
    queryKey: ['documents', userId],
    queryFn: () => DocService.getMyDocuments(userId),
    enabled: !!userId // Only fetch if user ID exists
  })

  // Controller to handle the recording of a new upload
  const uploadMutation = useMutation({
    mutationFn: ({ docType, url }: { docType: string, url: string }) => 
      DocService.recordDocument(userId, docType, url),
    onSuccess: () => {
      // Refresh the document list so the UI shows 'Pending' or a Green Check
      queryClient.invalidateQueries({ queryKey: ['documents', userId] })
    }
  })

  return { 
    documents: docsQuery.data, 
    isLoading: docsQuery.isLoading, 
    recordUpload: uploadMutation.mutate,
    isUploading: uploadMutation.isPending 
  }
}