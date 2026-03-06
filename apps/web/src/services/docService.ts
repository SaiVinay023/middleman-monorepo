import { supabase } from '@/lib/supabase'

export const DocService = {
  // Logic to save document metadata after Cloudinary upload
  async recordDocument(userId: string, docType: string, url: string) {
    const { data, error } = await supabase
      .from('documents')
      .insert({
        user_id: userId,
        document_type: docType,
        file_url: url,
        status: 'pending' // Default status for admin review
      })
      .select()
    
    if (error) throw error
    return data
  },

  // Logic to fetch a technician's uploaded documents
  async getMyDocuments(userId: string) {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
    
    if (error) throw error
    return data
  }
}