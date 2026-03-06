import { supabase } from '@/lib/supabase'

export const ProfileService = {
  // Logic to fetch a technician's public-facing profile
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('technicians')
      .select('*')
      .eq('id', userId)
      .single()
    
    if (error) throw error
    return data
  },

  // Business Logic: Update profile details
  async updateProfile(userId: string, updates: { full_name?: string, bio?: string, phone?: string, avatar_url?: string }) {
    const { data, error } = await supabase
      .from('technicians')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
    
    if (error) throw error
    return data
  }
}