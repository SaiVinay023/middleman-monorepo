import { supabase } from '@/lib/supabase'

export const AdminVerifyService = {
  // Fetch all documents that haven't been approved yet, with technician details
  async getPendingDocuments() {
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        technicians (
          full_name,
          email
        )
      `)
      .eq('status', 'pending')
    
    if (error) throw error
    return data
  },

  // Logic: Approve a document and potentially verify the technician
  async updateDocumentStatus(docId: string, userId: string, status: 'approved' | 'rejected') {
    // 1. Update the document status
    const { error: docError } = await supabase
      .from('documents')
      .update({ status })
      .eq('id', docId)

    if (docError) throw docError

    // 2. If approved, check if technician has any other pending docs. 
    // If all are approved, we could auto-verify the technician here.
    if (status === 'approved') {
      await supabase
        .from('technicians')
        .update({ is_verified: true })
        .eq('id', userId)
    }
    
    return { success: true }
  }
}