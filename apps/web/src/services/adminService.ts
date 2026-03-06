import { supabase } from '@/lib/supabase'

export const AdminService = {
  // 1. Fetch Company Gigs waiting for your approval to go live
  async getPendingCompanyGigs() {
    const { data, error } = await supabase
      .from('gigs')
      .select(`
        *,
        company:technicians!company_id(full_name)
      `)
      .eq('status', 'pending_admin')
      .is('deleted_at', null) // Filter out soft-deleted gigs
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  // 2. Fetch Freelancer Gigs waiting for your approval to release funds
  async getPendingWorkReviews() {
    const { data, error } = await supabase
      .from('gigs')
      .select(`
        *,
        freelancer:technicians!technician_id(full_name)
      `)
      .eq('status', 'pending_review')
      .order('updated_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // 3. Action: Move Company Gig to Marketplace
  async publishGig(gigId: string) {
    const { error } = await supabase
      .from('gigs')
      .update({ status: 'available' })
      .eq('id', gigId);

    if (error) throw error;
  },

  // 4. Action: Confirm Proof and Complete Payout
  async approveWork(gigId: string) {
    const { error } = await supabase
      .from('gigs')
      .update({ status: 'completed' })
      .eq('id', gigId);

    if (error) throw error;
  },

  // Master log for the Admin Table view
  async getAllGigs() {
    const { data, error } = await supabase
      .from('gigs')
      .select(`
        *,
        company:technicians!company_id(full_name),
        freelancer:technicians!technician_id(full_name)
      `)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  },

  async deleteGig(gigId: string) {
    const { error } = await supabase
      .from('gigs')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', gigId);

    if (error) throw error;
  }

}

// Add cron job or scheduled function
/*  export async function cleanupOldData() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  await supabase
    .from('gigs')
    .delete()
    .not('deleted_at', 'is', null)
    .lt('deleted_at', thirtyDaysAgo.toISOString());
} */