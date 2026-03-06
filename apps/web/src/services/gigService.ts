import { supabase } from '@/lib/supabase'

export const GigService = {
  // Fetch all available gigs (using your unrestricted view)
  async getAvailableGigs(filters?: { query?: string }) {
    let query = supabase
      .from('active_gigs')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters?.query) {
      // Supabase sanitizes parameters automatically when using proper methods
      const sanitized = filters.query.replace(/[%_]/g, '\\$&'); // Escape wildcards
      query = query.ilike('title', `%${sanitized}%`)
    }

    // BETTER: Use textSearch for full-text search
    if (filters?.query) {
      query = query.textSearch('title', filters.query, {
        type: 'websearch',
        config: 'english'
      });
    }


    const { data, error } = await query
    if (error) throw error
    return data
  },

  // Fetch gigs assigned to the current technician
  async getMyGigs(userId: string) {
    const { data, error } = await supabase
      .from('gigs')
      .select('*')
      .eq('technician_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  // Logic: Claim a gig
  async claimGig(gigId: string, userId: string) {
    const { data, error } = await supabase
      .from('gigs')
      .update({
        technician_id: userId,
        status: 'assigned',
        claimed_at: new Date().toISOString()
      })
      .eq('id', gigId)
      .is('technician_id', null)  // ✅ Only update if unclaimed
      .eq('status', 'available')  // ✅ Only available gigs
      .select()
      .single();

    if (error || !data) {
      throw new Error('Gig already claimed or unavailable');
    }

    return data;
  },

  async updateGigStatus(gigId: string, newStatus: string, userId: string) {
    const { data, error } = await supabase
      .from('gigs')
      .update({ status: newStatus })
      .eq('id', gigId)
      .eq('technician_id', userId)  // ✅ Verify ownership
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Unauthorized: You do not own this gig');
    return data;
  },


  async submitCompletion(gigId: string, cloudinaryUrl: string, userId: string) {
    const { data, error } = await supabase
      .from('gigs')
      .update({
        status: 'pending_review',
        completion_photo_url: cloudinaryUrl
      })
      .eq('id', gigId)
      .eq('technician_id', userId) // ✅ Verify that this user actually owns the gig
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Unauthorized: You do not have permission to complete this gig');
    return data;
  },

  async getBalance(userId: string) {
    const { data, error } = await supabase
      .from('gigs')
      .select('pay_amount, status')
      .eq('technician_id', userId)
      .in('status', ['pending_review', 'completed']);

    if (error) throw error;

    // Logic: 'completed' = Ready to withdraw, 'pending_review' = Processing
    const pending = data
      ?.filter(g => g.status === 'pending_review')
      .reduce((sum, g) => sum + (g.pay_amount || 0), 0) || 0;

    const available = data
      ?.filter(g => g.status === 'completed')
      .reduce((sum, g) => sum + (g.pay_amount || 0), 0) || 0;

    return { pending, available };
  },

  async getCompanyGigs(companyId: string) {
    const { data, error } = await supabase
      .from('gigs')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  },

  async createGig(gigData: Omit<import('@/types').Gig, 'id' | 'created_at' | 'status'>) {
    const { data, error } = await supabase
      .from('gigs')
      .insert([{
        ...gigData,
        status: 'pending_admin'
      }])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async processEscrowPayment(gigId: string) {
    const { data, error } = await supabase
      .from('gigs')
      .update({ status: 'available' })
      .eq('id', gigId)
      .eq('status', 'awaiting_payment')
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Gig is not awaiting payment or does not exist');
    return data;
  },

  async updateGigLocation(gigId: string, lat: number, lng: number) {
    const { data, error } = await supabase
      .from('gigs')
      .update({ current_lat: lat, current_lng: lng })
      .eq('id', gigId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async getGigCoordinates(gigId: string) {
    const { data, error } = await supabase
      .from('gigs')
      .select('current_lat, current_lng')
      .eq('id', gigId)
      .single();

    if (error) throw error;
    return data;
  }
}